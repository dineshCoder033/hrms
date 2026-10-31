const express = require('express');
const router = express.Router();
const recruitmentService = require('../services/recruitmentService');

// --- JOBS ---
router.get('/jobs', async (req, res, next) => {
  try {
    const data = await recruitmentService.getAllJobs();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/jobs', async (req, res, next) => {
  try {
    const data = await recruitmentService.createJob(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// --- CANDIDATES PIPELINE ---
router.get('/candidates', async (req, res, next) => {
  try {
    const data = await recruitmentService.getAllCandidates(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/candidates', async (req, res, next) => {
  try {
    const data = await recruitmentService.createCandidate(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.patch('/candidates/:id/stage', async (req, res, next) => {
  try {
    const { stage } = req.body;
    const data = await recruitmentService.updateCandidateStage(req.params.id, stage);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
