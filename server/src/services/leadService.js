const Lead = require('../models/Lead');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('./dataService');

const getAllLeads = async () => {
  if (getIsConnected()) {
    return await Lead.find().sort({ createdAt: -1 });
  }
  return memoryStore.leads;
};

const createLead = async (data) => {
  if (getIsConnected()) {
    return await Lead.create(data);
  }
  const newLead = {
    ...data,
    id: `lead-${Date.now()}`
  };
  memoryStore.leads.unshift(newLead);
  return newLead;
};

module.exports = {
  getAllLeads,
  createLead
};
