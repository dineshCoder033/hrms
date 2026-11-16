const crypto = require('crypto');
const { z } = require('zod');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const ImportJob = require('../models/ImportJob');
const { getNextEmployeeCode } = require('../models/Counter');
const { encrypt, decrypt, maskAccountNumber } = require('../utils/crypto');
const { sendInviteEmail } = require('../utils/email');
const ApiError = require('../errors/ApiError');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const sanitizeEmployeeResponse = (emp, isPrivileged) => {
  const obj = emp.toObject ? emp.toObject() : { ...emp };
  if (!isPrivileged) {
    delete obj.salary;
    delete obj.annualCtc;
    delete obj.bank;
    delete obj.governmentIds;
    delete obj.pfNumber;
    delete obj.esiNumber;
  } else {
    if (obj.bank && obj.bank.accountNumberEnc) {
      obj.bank.accountNumberMasked = maskAccountNumber(decrypt(obj.bank.accountNumberEnc));
    }
    if (obj.governmentIds) {
      if (obj.governmentIds.aadhaarNumberEnc) {
        const raw = decrypt(obj.governmentIds.aadhaarNumberEnc);
        obj.governmentIds.aadhaarMasked = `XXXX-XXXX-${raw.slice(-4)}`;
      }
      if (obj.governmentIds.panNumberEnc) {
        const raw = decrypt(obj.governmentIds.panNumberEnc);
        obj.governmentIds.panMasked = `${raw.slice(0, 2)}****${raw.slice(-2)}`;
      }
    }
  }
  return obj;
};

const getAllEmployees = async (user) => {
  const isPrivileged = ['Admin', 'HR'].includes(user.role);

  let query = Employee.find().populate('manager', 'name email employeeCode').sort({ createdAt: -1 });

  if (!isPrivileged) {
    if (user.role === 'Manager' && user.employeeId) {
      query = Employee.find({
        $or: [{ manager: user.employeeId }, { _id: user.employeeId }]
      }).populate('manager', 'name email employeeCode').sort({ createdAt: -1 });
    } else {
      query = Employee.find({ _id: user.employeeId }).populate('manager', 'name email employeeCode');
    }
  }

  const list = await query;
  return list.map(emp => sanitizeEmployeeResponse(emp, isPrivileged));
};

const getEmployeeById = async (id, user) => {
  const isPrivileged = ['Admin', 'HR'].includes(user.role);

  const employee = await Employee.findById(id).populate('manager', 'name email employeeCode');
  if (!employee) throw ApiError.notFound('Employee not found');

  if (!isPrivileged) {
    const isSelf = user.employeeId === id || user.employeeId === employee._id.toString();
    if (user.role === 'Manager') {
      const isTeam = employee.manager && employee.manager._id.toString() === user.employeeId;
      if (!isSelf && !isTeam) {
        throw ApiError.forbidden('You are not authorized to view this employee profile.');
      }
    } else if (!isSelf) {
      throw ApiError.forbidden('You are only authorized to view your own employee profile.');
    }
  }

  return sanitizeEmployeeResponse(employee, isPrivileged);
};

/**
 * 2.2 Single Employee Creation (Admin / HR)
 */
const createEmployee = async (data) => {
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw ApiError.badRequest('An account with this email address already exists.');
  }

  const existingEmp = await Employee.findOne({ email: data.email.toLowerCase() });
  if (existingEmp) {
    throw ApiError.badRequest('An employee with this email address already exists.');
  }

  // 1. Auto generate unique employee code
  const employeeCode = await getNextEmployeeCode();

  // 2. Encrypt bank details & Govt IDs if provided
  let bankData = undefined;
  if (data.bank) {
    const rawAcc = data.bank.accountNumber || '';
    bankData = {
      holderName: data.bank.holderName,
      accountNumberEnc: rawAcc ? encrypt(rawAcc) : undefined,
      maskedAccount: rawAcc ? maskAccountNumber(rawAcc) : undefined,
      ifsc: data.bank.ifsc,
      bankName: data.bank.bankName,
      branchName: data.bank.branchName,
      pincode: data.bank.pincode
    };
  }

  const govtIds = {
    aadhaarNumberEnc: data.aadhaarNumber ? encrypt(data.aadhaarNumber) : undefined,
    panNumberEnc: data.panNumber ? encrypt(data.panNumber) : undefined,
    aadhaarMasked: data.aadhaarNumber ? `XXXX-XXXX-${data.aadhaarNumber.slice(-4)}` : undefined,
    panMasked: data.panNumber ? `${data.panNumber.slice(0, 2)}****${data.panNumber.slice(-2)}` : undefined
  };

  const fullName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Employee';

  // 3. Create Employee document
  const annualCtc = Number(data.annualCtc || data.salary || 65000);
  const employee = await Employee.create({
    employeeCode,
    firstName: data.firstName,
    lastName: data.lastName,
    name: fullName,
    email: data.email.toLowerCase(),
    phone: data.phone,
    bloodGroup: data.bloodGroup || 'Unknown',
    maritalStatus: data.maritalStatus || 'Single',
    dateOfBirth: data.dateOfBirth,
    gender: data.gender || 'Other',
    role: data.role || data.designation || 'Software Engineer',
    designation: data.designation || data.role || 'Software Engineer',
    department: data.department || 'Engineering',
    manager: data.manager || null,
    workMode: data.workMode || 'Office',
    officeLocation: data.officeLocation || null,
    annualCtc,
    salary: annualCtc,
    status: data.status || 'Active',
    joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
    experienceYears: Number(data.experienceYears || 0),
    isPfEligible: data.isPfEligible !== undefined ? data.isPfEligible : true,
    pfNumber: data.pfNumber,
    isEsiEligible: data.isEsiEligible !== undefined ? data.isEsiEligible : false,
    esiNumber: data.esiNumber,
    education: data.education || [],
    governmentIds: govtIds,
    bank: bankData,
    address: data.address,
    location: data.address?.city ? `${data.address.city}, ${data.address.country || 'India'}` : (data.location || 'India'),
    emergencyContact: data.emergencyContact
  });

  // 4. Create User with credentials (custom password if provided by Admin, else auto-generated invite)
  const tempPassword = data.password || (crypto.randomBytes(16).toString('hex') + 'A1!');
  const inviteToken = crypto.randomBytes(32).toString('hex');
  const inviteTokenHash = hashToken(inviteToken);

  const user = await User.create({
    name: employee.name,
    email: employee.email,
    password: tempPassword,
    role: data.userRole || 'Employee',
    employeeId: employee._id,
    isActive: true,
    mustChangePassword: !data.password, // If Admin explicitly gave a password, user can log in immediately
    inviteTokenHash: data.password ? undefined : inviteTokenHash,
    inviteExpiresAt: data.password ? undefined : new Date(Date.now() + 48 * 60 * 60 * 1000)
  });

  // 5. Send Invite Email (non-blocking)
  sendInviteEmail({
    to: employee.email,
    name: employee.name,
    inviteToken,
    tempPassword: data.password || tempPassword
  }).catch(err => console.warn('Email dispatch warning:', err.message));

  return {
    employee: sanitizeEmployeeResponse(employee, true),
    user: user.toJSON(),
    inviteToken // Returned in dev mode for easy testing
  };
};

const updateEmployee = async (id, data, user) => {
  const isPrivileged = ['Admin', 'HR'].includes(user.role);

  if (!isPrivileged) {
    const isSelf = user.employeeId === id;
    if (!isSelf) {
      throw ApiError.forbidden('You can only update your own employee profile.');
    }

    // Disallow editing restricted fields
    delete data.salary;
    delete data.annualCtc;
    delete data.role;
    delete data.designation;
    delete data.department;
    delete data.manager;
    delete data.status;
    delete data.employeeCode;
  }

  if (data.bank && data.bank.accountNumber) {
    data.bank.accountNumberEnc = encrypt(data.bank.accountNumber);
    delete data.bank.accountNumber;
  }

  const updated = await Employee.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  if (!updated) throw ApiError.notFound('Employee not found');
  return sanitizeEmployeeResponse(updated, isPrivileged);
};

const deleteEmployee = async (id, user) => {
  const isPrivileged = ['Admin', 'HR'].includes(user.role);
  if (!isPrivileged) {
    throw ApiError.forbidden('Only Admin and HR can delete employee records.');
  }

  const employee = await Employee.findById(id);
  if (!employee) throw ApiError.notFound('Employee not found');

  // Remove linked user account so they can no longer log in
  await User.deleteOne({ employeeId: id });
  // Delete the employee record
  await Employee.findByIdAndDelete(id);

  return { success: true, message: `Employee ${employee.name} deleted successfully` };
};

/**
 * 2.4 Profile self-service update by employee
 */
const updateOwnProfile = async (user, profileData) => {
  if (!user.employeeId) {
    throw ApiError.badRequest('No linked employee profile found.');
  }

  const allowedUpdates = {};
  if (profileData.phone) allowedUpdates.phone = profileData.phone;
  if (profileData.emergencyContact) allowedUpdates.emergencyContact = profileData.emergencyContact;

  if (profileData.bank) {
    allowedUpdates.bank = {
      holderName: profileData.bank.holderName,
      accountNumberEnc: profileData.bank.accountNumber ? encrypt(profileData.bank.accountNumber) : undefined,
      ifsc: profileData.bank.ifsc,
      bankName: profileData.bank.bankName
    };
  }

  const updated = await Employee.findByIdAndUpdate(user.employeeId, allowedUpdates, { returnDocument: 'after' });
  return sanitizeEmployeeResponse(updated, false);
};

/**
 * 2.4 Document attachment
 */
const addEmployeeDocument = async (employeeId, docMeta, user) => {
  const isPrivileged = ['Admin', 'HR'].includes(user.role);
  if (!isPrivileged && user.employeeId !== employeeId) {
    throw ApiError.forbidden('You can only upload documents for your own profile.');
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) throw ApiError.notFound('Employee not found');

  employee.documents.push(docMeta);
  await employee.save();
  return employee.documents;
};

/**
 * 2.3 Bulk Import Helper: Template Download
 */
const getCsvTemplate = () => {
  const headers = [
    'name',
    'email',
    'phone',
    'department',
    'designation',
    'managerEmail',
    'workMode',
    'joinDate',
    'annualCtc'
  ];
  const exampleRow = [
    'Jane Doe',
    'jane.doe@example.com',
    '+1 555-0199',
    'Engineering',
    'Senior Frontend Engineer',
    'manager.mike@test.com',
    'Hybrid',
    '2026-04-01',
    '95000'
  ];
  return [headers.join(','), exampleRow.join(',')].join('\n');
};

/**
 * 2.3 Bulk Import Preview Engine
 */
const rowSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  managerEmail: z.string().email().optional().or(z.literal('')),
  workMode: z.enum(['Office', 'Remote', 'Hybrid']).default('Office'),
  joinDate: z.string().optional(),
  annualCtc: z.coerce.number().min(0).default(65000)
});

const previewBulkImport = async (parsedRows) => {
  if (!Array.isArray(parsedRows) || parsedRows.length === 0) {
    throw ApiError.badRequest('No data rows found in uploaded file.');
  }
  if (parsedRows.length > 1000) {
    throw ApiError.badRequest('Uploaded file exceeds maximum limit of 1,000 rows.');
  }

  const fileEmails = new Set();
  const validRows = [];
  const reportRows = [];

  // Pre-load all existing emails from DB for fast batch check
  const existingEmails = new Set(await User.distinct('email'));
  const existingEmpEmails = new Set(await Employee.distinct('email'));

  for (let i = 0; i < parsedRows.length; i++) {
    const raw = parsedRows[i];
    const rowNum = i + 2; // Accounting for 1-based index + CSV header
    const errors = [];

    // Clean whitespace
    const rowData = {};
    Object.keys(raw).forEach(k => {
      rowData[k.trim()] = typeof raw[k] === 'string' ? raw[k].trim() : raw[k];
    });

    const parsed = rowSchema.safeParse(rowData);
    if (!parsed.success) {
      parsed.error.issues.forEach(err => errors.push(err.message));
    }

    const email = rowData.email?.toLowerCase();
    if (email) {
      if (fileEmails.has(email)) {
        errors.push(`Duplicate email in file: ${email}`);
      } else {
        fileEmails.add(email);
      }

      if (existingEmails.has(email) || existingEmpEmails.has(email)) {
        errors.push(`Email already registered in system: ${email}`);
      }
    }

    if (errors.length === 0) {
      validRows.push(parsed.data);
      reportRows.push({ row: rowNum, status: 'ok', data: parsed.data });
    } else {
      reportRows.push({ row: rowNum, status: 'error', data: rowData, errors });
    }
  }

  const importId = `imp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  await ImportJob.create({
    importId,
    validRows,
    summary: {
      total: parsedRows.length,
      validCount: validRows.length,
      invalidCount: parsedRows.length - validRows.length
    }
  });

  return {
    importId,
    totalRows: parsedRows.length,
    validCount: validRows.length,
    invalidCount: parsedRows.length - validRows.length,
    rows: reportRows
  };
};

/**
 * 2.3 Bulk Import Commit Engine
 */
const commitBulkImport = async (importId) => {
  const job = await ImportJob.findOne({ importId });
  if (!job) {
    throw ApiError.notFound('Import session expired or not found. Please upload again.');
  }

  const rows = job.validRows;
  if (!rows || rows.length === 0) {
    throw ApiError.badRequest('No valid rows available to commit.');
  }

  let createdCount = 0;
  let failedCount = 0;

  for (const row of rows) {
    try {
      let managerId = null;
      if (row.managerEmail) {
        const mgr = await Employee.findOne({ email: row.managerEmail.toLowerCase() });
        if (mgr) managerId = mgr._id;
      }

      const employeeCode = await getNextEmployeeCode();
      const employee = await Employee.create({
        employeeCode,
        name: row.name,
        email: row.email.toLowerCase(),
        phone: row.phone,
        role: row.designation,
        designation: row.designation,
        department: row.department,
        manager: managerId,
        workMode: row.workMode || 'Office',
        annualCtc: row.annualCtc,
        salary: row.annualCtc,
        status: 'Active',
        joinDate: row.joinDate ? new Date(row.joinDate) : new Date()
      });

      const inviteToken = crypto.randomBytes(32).toString('hex');
      const inviteTokenHash = hashToken(inviteToken);
      const tempPassword = crypto.randomBytes(16).toString('hex') + 'A1!';

      await User.create({
        name: employee.name,
        email: employee.email,
        password: tempPassword,
        role: 'Employee',
        employeeId: employee._id,
        isActive: true,
        mustChangePassword: true,
        inviteTokenHash,
        inviteExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
      });

      // Send invite email (silently logs in dev)
      sendInviteEmail({
        to: employee.email,
        name: employee.name,
        inviteToken
      }).catch(() => {});

      createdCount++;
    } catch (err) {
      console.error(`Failed to commit row for ${row.email}:`, err.message);
      failedCount++;
    }
  }

  // Purge committed job
  await ImportJob.deleteOne({ importId });

  return {
    success: true,
    createdCount,
    failedCount,
    message: `Successfully imported ${createdCount} employees.`
  };
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateOwnProfile,
  addEmployeeDocument,
  getCsvTemplate,
  previewBulkImport,
  commitBulkImport
};
