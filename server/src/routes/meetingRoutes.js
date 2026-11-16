const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// View meetings (Scoped by role: Employee sees own, Manager sees team, Admin/HR sees all)
router.get('/', meetingController.getMeetings);

// Free slot / booked slots availability check
router.get('/availability', authorize('Manager', 'HR', 'Admin'), meetingController.getAvailability);

// View single meeting details
router.get('/:id', meetingController.getMeetingById);

// Download RFC 5545 iCalendar (.ics) format
router.get('/:id/ics', meetingController.downloadIcs);

// Schedule new meeting (Manager, HR, Admin only)
router.post('/', authorize('Manager', 'HR', 'Admin'), meetingController.createMeeting);

// Update meeting details (Organizer or Admin/HR)
router.patch('/:id', authorize('Manager', 'HR', 'Admin'), meetingController.updateMeeting);

// Cancel meeting (Soft delete -> status: 'Cancelled')
router.delete('/:id', authorize('Manager', 'HR', 'Admin'), meetingController.cancelMeeting);

// RSVP response (Accept / Decline) for attendees
router.post('/:id/respond', meetingController.respondToMeeting);

module.exports = router;

