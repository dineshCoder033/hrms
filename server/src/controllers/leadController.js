const leadService = require('../services/leadService');

const getLeads = async (req, res, next) => {
  try {
    const data = await leadService.getAllLeads();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getLeadById = async (req, res, next) => {
  try {
    const data = await leadService.getLeadById(req.params.id);
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

const updateLead = async (req, res, next) => {
  try {
    const data = await leadService.updateLead(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const data = await leadService.deleteLead(req.params.id);
    res.json({ success: true, message: 'Lead deleted successfully', data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
};
