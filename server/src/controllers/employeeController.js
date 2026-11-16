const Papa = require('papaparse');
const ExcelJS = require('exceljs');
const employeeService = require('../services/employeeService');
const ApiError = require('../errors/ApiError');

const getEmployees = async (req, res, next) => {
  try {
    const data = await employeeService.getAllEmployees(req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const data = await employeeService.getEmployeeById(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const result = await employeeService.createEmployee(req.body);
    const data = {
      ...(result.employee || result),
      user: result.user,
      inviteToken: result.inviteToken
    };
    res.status(201).json({
      success: true,
      message: 'Employee and user account created successfully. Invitation email sent.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const data = await employeeService.updateEmployee(req.params.id, req.body, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const data = await employeeService.deleteEmployee(req.params.id, req.user);
    res.json({ success: true, message: 'Employee deleted successfully', data });
  } catch (error) {
    next(error);
  }
};

const getOwnProfile = async (req, res, next) => {
  try {
    if (!req.user.employeeId) {
      throw ApiError.notFound('No employee profile linked to this account.');
    }
    const data = await employeeService.getEmployeeById(req.user.employeeId, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateOwnProfile = async (req, res, next) => {
  try {
    const data = await employeeService.updateOwnProfile(req.user, req.body);
    res.json({ success: true, message: 'Profile updated successfully', data });
  } catch (error) {
    next(error);
  }
};

const { uploadToCloudStorage } = require('../utils/storage');

const addDocument = async (req, res, next) => {
  try {
    const file = req.file;
    const { type = 'General' } = req.body;

    if (!file) {
      throw ApiError.badRequest('Please upload a valid file (PDF/JPG/PNG, max 5MB).');
    }

    // Enterprise Cloud Storage Upload (Cloudinary / Local)
    const uploadResult = await uploadToCloudStorage(file.buffer, {
      folder: `hrms_docs/${req.params.id}`,
      filename: file.originalname,
      mimetype: file.mimetype
    });

    const docMeta = {
      type,
      fileName: file.originalname,
      fileUrl: uploadResult.fileUrl,
      uploadedAt: new Date()
    };

    const documents = await employeeService.addEmployeeDocument(req.params.id, docMeta, req.user);
    res.status(201).json({ 
      success: true, 
      message: `Document attached successfully (${uploadResult.storageProvider})`, 
      data: documents 
    });
  } catch (error) {
    next(error);
  }
};

const downloadTemplate = (req, res) => {
  const csv = employeeService.getCsvTemplate();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="employee_import_template.csv"');
  res.status(200).send(csv);
};

const previewImport = async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('Please upload a .csv or .xlsx file.');
    }

    const filename = req.file.originalname.toLowerCase();
    let rows = [];

    if (filename.endsWith('.csv')) {
      const csvString = req.file.buffer.toString('utf8');
      const parsed = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true
      });
      rows = parsed.data;
    } else if (filename.endsWith('.xlsx')) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw ApiError.badRequest('Excel sheet contains no worksheets.');
      }

      const headers = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.value || '').trim();
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip headers
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (header) {
            rowData[header] = cell.text || String(cell.value || '');
          }
        });
        if (Object.keys(rowData).length > 0) {
          rows.push(rowData);
        }
      });
    } else {
      throw ApiError.badRequest('Invalid file format. Please upload a .csv or .xlsx file.');
    }

    const previewResult = await employeeService.previewBulkImport(rows);
    res.json({ success: true, data: previewResult });
  } catch (error) {
    next(error);
  }
};

const commitImport = async (req, res, next) => {
  try {
    const { importId } = req.body;
    if (!importId) {
      throw ApiError.badRequest('importId is required to commit bulk import.');
    }
    const result = await employeeService.commitBulkImport(importId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getOwnProfile,
  updateOwnProfile,
  addDocument,
  downloadTemplate,
  previewImport,
  commitImport
};
