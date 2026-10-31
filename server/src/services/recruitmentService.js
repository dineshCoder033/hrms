const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const { getIsConnected } = require('../config/db');
const ApiError = require('../errors/ApiError');

// In-memory fallback
let memoryJobs = [
  { id: 'job-1', title: 'Senior Full Stack Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', openings: 2, applicantsCount: 18, salaryRange: '$120k - $160k', status: 'Active' },
  { id: 'job-2', title: 'Security & DevOps Architect', department: 'Infrastructure', location: 'New York, USA', type: 'Full-time', openings: 1, applicantsCount: 9, salaryRange: '$140k - $180k', status: 'Active' },
  { id: 'job-3', title: 'Product UI/UX Designer', department: 'Design', location: 'San Francisco, CA', type: 'Full-time', openings: 1, applicantsCount: 24, salaryRange: '$100k - $135k', status: 'Active' },
  { id: 'job-4', title: 'People Operations Specialist', department: 'Human Resources', location: 'Austin, TX', type: 'Full-time', openings: 1, applicantsCount: 14, salaryRange: '$75k - $95k', status: 'Active' }
];

let memoryCandidates = [
  { id: 'cand-1', jobTitle: 'Senior Full Stack Engineer', name: 'Lucas Scott', email: 'lucas.s@example.com', phone: '+1 (555) 234-5678', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', stage: 'Interview', rating: 5, experienceYears: 6 },
  { id: 'cand-2', jobTitle: 'Product UI/UX Designer', name: 'Elena Rostova', email: 'elena.r@example.com', phone: '+1 (555) 345-6789', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', stage: 'Screening', rating: 4, experienceYears: 4 },
  { id: 'cand-3', jobTitle: 'Security & DevOps Architect', name: 'David Chang', email: 'd.chang@example.com', phone: '+1 (555) 456-7890', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', stage: 'Offer', rating: 5, experienceYears: 8 }
];

const getAllJobs = async () => {
  if (getIsConnected()) {
    return await Job.find().sort({ createdAt: -1 });
  }
  return memoryJobs;
};

const createJob = async (data) => {
  if (getIsConnected()) {
    return await Job.create(data);
  }
  const newJob = { id: `job-${Date.now()}`, ...data, applicantsCount: 0 };
  memoryJobs.unshift(newJob);
  return newJob;
};

const getAllCandidates = async (query = {}) => {
  if (getIsConnected()) {
    const filter = {};
    if (query.stage) filter.stage = query.stage;
    if (query.jobId) filter.jobId = query.jobId;
    return await Candidate.find(filter).sort({ createdAt: -1 });
  }
  let list = memoryCandidates;
  if (query.stage) list = list.filter(c => c.stage === query.stage);
  return list;
};

const createCandidate = async (data) => {
  if (getIsConnected()) {
    const candidate = await Candidate.create(data);
    if (data.jobId) {
      await Job.findByIdAndUpdate(data.jobId, { $inc: { applicantsCount: 1 } });
    }
    return candidate;
  }
  const newCand = { id: `cand-${Date.now()}`, ...data };
  memoryCandidates.unshift(newCand);
  return newCand;
};

const updateCandidateStage = async (id, stage) => {
  const allowedStages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
  if (!allowedStages.includes(stage)) {
    throw ApiError.badRequest(`Invalid stage. Allowed: ${allowedStages.join(', ')}`);
  }

  if (getIsConnected()) {
    const candidate = await Candidate.findByIdAndUpdate(id, { stage }, { new: true });
    if (!candidate) throw ApiError.notFound('Candidate not found');
    return candidate;
  }

  const cand = memoryCandidates.find(c => c.id === id || c._id?.toString() === id);
  if (!cand) throw ApiError.notFound('Candidate not found');
  cand.stage = stage;
  return cand;
};

module.exports = {
  getAllJobs,
  createJob,
  getAllCandidates,
  createCandidate,
  updateCandidateStage
};
