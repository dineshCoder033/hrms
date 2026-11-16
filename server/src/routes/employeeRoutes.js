const express = require('express');
const multer = require('multer');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createEmployeeSchema, updateEmployeeSchema } = require('../validators/employeeValidator');

// Multer memory storage configuration (Max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(authenticate);

// 2.3 Bulk Import Endpoints (Admin & HR only)
router.get('/import/template', authorize('Admin', 'HR'), employeeController.downloadTemplate);
router.post('/import/preview', authorize('Admin', 'HR'), upload.single('file'), employeeController.previewImport);
router.post('/import/commit', authorize('Admin', 'HR'), employeeController.commitImport);

// 2.4 Self-service Profile View & Update (Own Phone, Emergency Contact, Bank Details)
router.get('/profile', employeeController.getOwnProfile);
router.patch('/profile', employeeController.updateOwnProfile);

// 2.4 Document Upload
router.post('/:id/documents', upload.single('file'), employeeController.addDocument);

// Employee CRUD
router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', authorize('Admin', 'HR'), validate(createEmployeeSchema), employeeController.createEmployee);
router.patch('/:id', validate(updateEmployeeSchema), employeeController.updateEmployee);
router.delete('/:id', authorize('Admin', 'HR'), employeeController.deleteEmployee);

module.exports = router;
