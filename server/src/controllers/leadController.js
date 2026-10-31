const leadService = require('../services/leadService');

const getLeads = async (req, res, next) => {
  try {
    const data = await leadService.getAllLeads();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createLead = async (req, res, next) => {
  try {
    const data = await leadService.createLead(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  createLead
};
