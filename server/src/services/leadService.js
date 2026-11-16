const Lead = require('../models/Lead');
const ApiError = require('../errors/ApiError');

const getAllLeads = async () => {
  return await Lead.find().sort({ createdAt: -1 });
};

const getLeadById = async (id) => {
  const lead = await Lead.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');
  return lead;
};

const createLead = async (data) => {
  return await Lead.create(data);
};

const updateLead = async (id, data) => {
  const updated = await Lead.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  if (!updated) throw ApiError.notFound('Lead not found');
  return updated;
};

const deleteLead = async (id) => {
  const deleted = await Lead.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound('Lead not found');
  return deleted;
};

module.exports = {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
};
