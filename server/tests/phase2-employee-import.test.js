const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const env = require('../src/config/env');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const { Counter } = require('../src/models/Counter');
const { encrypt, decrypt } = require('../src/utils/crypto');

describe('Phase 2: Employee Master & Bulk Import Test Suite', () => {
  let adminToken, hrToken, empToken;
  let adminUser, hrUser, empUser;
  let adminEmployee, hrEmployee, empEmployee;

  beforeAll(async () => {
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Counter.deleteMany({});

    adminEmployee = await Employee.create({
      name: 'Admin Boss',
      role: 'Director',
      department: 'Executive',
      email: 'admin.boss@test.com'
    });

    hrEmployee = await Employee.create({
      name: 'HR Helen',
      role: 'HR Specialist',
      department: 'Human Resources',
      email: 'helen.hr@test.com'
    });

    empEmployee = await Employee.create({
      name: 'Dev Dave',
      role: 'Developer',
      department: 'Engineering',
      email: 'dave.dev@test.com'
    });

    adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin.boss@test.com',
      password: 'AdminPassword123',
      role: 'Admin',
      employeeId: adminEmployee._id,
      isActive: true
    });

    hrUser = await User.create({
      name: 'HR Helen',
      email: 'helen.hr@test.com',
      password: 'Password123',
      role: 'HR',
      employeeId: hrEmployee._id,
      isActive: true
    });

    empUser = await User.create({
      name: 'Dev Dave',
      email: 'dave.dev@test.com',
      password: 'Password123',
      role: 'Employee',
      employeeId: empEmployee._id,
      isActive: true
    });

    adminToken = jwt.sign({ id: adminUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    hrToken = jwt.sign({ id: hrUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    empToken = jwt.sign({ id: empUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  });

  test('1. Single employee creation auto-generates employeeCode, User, and invite token', async () => {
    const newEmpData = {
      name: 'John Recruit',
      email: 'john.recruit@test.com',
      phone: '+1 555-0199',
      role: 'Cloud Architect',
      designation: 'Cloud Architect',
      department: 'Engineering',
      annualCtc: 120000,
      bank: {
        holderName: 'John Recruit',
        accountNumber: '987654321098',
        ifsc: 'HDFC0001234',
        bankName: 'HDFC Bank'
      }
    };

    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${hrToken}`)
      .send(newEmpData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.employee.employeeCode).toMatch(/^EMP-\d{4}$/);
    expect(res.body.data.user.email).toBe('john.recruit@test.com');
    expect(res.body.data.inviteToken).toBeDefined();

    // Verify bank account was encrypted in DB
    const dbEmp = await Employee.findOne({ email: 'john.recruit@test.com' });
    expect(dbEmp.bank.accountNumberEnc).toBeDefined();
    expect(dbEmp.bank.accountNumberEnc).not.toBe('987654321098');
    expect(decrypt(dbEmp.bank.accountNumberEnc)).toBe('987654321098');

    // 2. Set password using the generated invite token
    const setPassRes = await request(app)
      .post('/api/auth/set-password')
      .send({
        token: res.body.data.inviteToken,
        password: 'NewStrongPassword123'
      });

    expect(setPassRes.status).toBe(200);
    expect(setPassRes.body.success).toBe(true);

    // Verify user can now log in with the new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.recruit@test.com',
        password: 'NewStrongPassword123'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeDefined();
  });

  test('3. Download CSV bulk import template', async () => {
    const res = await request(app)
      .get('/api/employees/import/template')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('name,email,phone,department,designation');
  });

  test('4. Bulk Import: Preview checks valid and duplicate rows, then Commit provisions users', async () => {
    const csvContent = [
      'name,email,phone,department,designation,managerEmail,workMode,joinDate,annualCtc',
      'Batch User 1,batch1@test.com,+1 555-1111,Engineering,Frontend Lead,helen.hr@test.com,Office,2026-05-01,110000',
      'Duplicate Admin,admin.boss@test.com,+1 555-2222,Engineering,Dev,helen.hr@test.com,Remote,2026-05-01,90000', // Existing email in DB
      'Batch User 2,batch2@test.com,+1 555-3333,Design,UI Designer,helen.hr@test.com,Hybrid,2026-05-01,85000'
    ].join('\n');

    // Preview
    const previewRes = await request(app)
      .post('/api/employees/import/preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(csvContent, 'utf-8'), 'import_sample.csv');

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.data.totalRows).toBe(3);
    expect(previewRes.body.data.validCount).toBe(2);
    expect(previewRes.body.data.invalidCount).toBe(1);

    const importId = previewRes.body.data.importId;
    expect(importId).toBeDefined();

    // Commit
    const commitRes = await request(app)
      .post('/api/employees/import/commit')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ importId });

    expect(commitRes.status).toBe(200);
    expect(commitRes.body.data.createdCount).toBe(2);

    // Verify employees exist in DB
    const createdEmp = await Employee.findOne({ email: 'batch1@test.com' });
    expect(createdEmp).toBeDefined();
    expect(createdEmp.employeeCode).toMatch(/^EMP-\d{4}$/);

    const createdUser = await User.findOne({ email: 'batch1@test.com' });
    expect(createdUser).toBeDefined();
    expect(createdUser.mustChangePassword).toBe(true);
  });

  test('5. Self-service profile update: Employee can update phone and emergency contact', async () => {
    const res = await request(app)
      .patch('/api/employees/profile')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        phone: '+1 999-888-7777',
        emergencyContact: {
          name: 'Sarah Dave',
          phone: '+1 999-888-6666',
          relation: 'Spouse'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe('+1 999-888-7777');
    expect(res.body.data.emergencyContact.name).toBe('Sarah Dave');
  });
});

