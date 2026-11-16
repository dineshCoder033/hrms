const express = require('express');
const router = express.Router();
const recruitmentService = require('../services/recruitmentService');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createJobSchema,
  createCandidateSchema,
  updateCandidateStageSchema
} = require('../validators/recruitmentValidator');

// Recruitment: Accessible to Admin, HR & Employee (Read & Browse)
router.use(authenticate);

// --- JOBS (All authenticated users including Employee can view open jobs) ---
router.get('/jobs', async (req, res, next) => {
  try {
    const data = await recruitmentService.getAllJobs();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Admin & HR Only for job creation & candidate management
router.post('/jobs', authorize('Admin', 'HR'), validate(createJobSchema), async (req, res, next) => {
  try {
    const data = await recruitmentService.createJob(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/jobs/:id', authorize('Admin', 'HR'), async (req, res, next) => {
  try {
    const data = await recruitmentService.deleteJob(req.params.id);
    res.json({ success: true, message: 'Job deleted', data });
  } catch (error) {
    next(error);
  }
});

// --- CANDIDATES PIPELINE (Admin & HR only) ---
router.get('/candidates', authorize('Admin', 'HR'), async (req, res, next) => {
  try {
    const data = await recruitmentService.getAllCandidates(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/candidates', authorize('Admin', 'HR'), validate(createCandidateSchema), async (req, res, next) => {
  try {
    const data = await recruitmentService.createCandidate(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.patch('/candidates/:id/stage', validate(updateCandidateStageSchema), async (req, res, next) => {
  try {
    const { stage } = req.body;
    const data = await recruitmentService.updateCandidateStage(req.params.id, stage);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/candidates/:id', authorize('Admin', 'HR'), async (req, res, next) => {
  try {
    const data = await recruitmentService.deleteCandidate(req.params.id);
    res.json({ success: true, message: 'Candidate deleted', data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
