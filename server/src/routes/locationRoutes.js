const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// View active office locations (All authenticated users)
router.get('/', locationController.getLocations);

// Manage locations (Admin & HR only)
router.post('/', authorize('Admin', 'HR'), locationController.createLocation);
router.patch('/:id', authorize('Admin', 'HR'), locationController.updateLocation);
router.delete('/:id', authorize('Admin', 'HR'), locationController.deleteLocation);

module.exports = router;

