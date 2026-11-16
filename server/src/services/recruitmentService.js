const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const ApiError = require('../errors/ApiError');

const getAllJobs = async () => {
  return await Job.find().sort({ createdAt: -1 });
};

const createJob = async (data) => {
  return await Job.create(data);
};

const getAllCandidates = async (query = {}) => {
  const filter = {};
  if (query.stage) filter.stage = query.stage;
  if (query.jobId) filter.jobId = query.jobId;
  return await Candidate.find(filter).sort({ createdAt: -1 });
};

const createCandidate = async (data) => {
  const candidate = await Candidate.create(data);
  if (data.jobId) {
    await Job.findByIdAndUpdate(data.jobId, { $inc: { applicantsCount: 1 } });
  }
  return candidate;
};

const updateCandidateStage = async (id, stage) => {
  const updated = await Candidate.findByIdAndUpdate(
    id,
    { stage },
    { returnDocument: 'after', runValidators: true }
  );
  if (!updated) throw ApiError.notFound('Candidate not found');
  return updated;
};

const deleteJob = async (id) => {
  const deleted = await Job.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound('Job posting not found');
  return deleted;
};

const deleteCandidate = async (id) => {
  const deleted = await Candidate.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound('Candidate not found');
  return deleted;
};

module.exports = {
  getAllJobs,
  createJob,
  deleteJob,
  getAllCandidates,
  createCandidate,
  updateCandidateStage,
  deleteCandidate
};
