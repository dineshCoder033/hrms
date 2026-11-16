const { z } = require('zod');

const createJobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  department: z.string().min(2, 'Department is required'),
  location: z.string().default('Remote'),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']).default('Full-time'),
  openings: z.coerce.number().min(1).default(1),
  salaryRange: z.string().optional(),
  status: z.enum(['Active', 'Closed', 'Draft']).default('Active')
});

const createCandidateSchema = z.object({
  name: z.string().min(2, 'Candidate name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  jobTitle: z.string().min(2, 'Job title is required'),
  jobId: z.string().optional(),
  stage: z.enum(['Screening', 'Interview', 'Offer', 'Hired', 'Rejected']).default('Screening'),
  rating: z.coerce.number().min(1).max(5).default(4),
  experienceYears: z.coerce.number().min(0).default(0),
  avatar: z.string().url().optional()
});

const updateCandidateStageSchema = z.object({
  stage: z.enum(['Screening', 'Interview', 'Offer', 'Hired', 'Rejected'])
});

module.exports = {
  createJobSchema,
  createCandidateSchema,
  updateCandidateStageSchema
};

