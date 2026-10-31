const { z } = require('zod');

const createLeadSchema = {
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    role: z.string().min(2, 'Role is required'),
    company: z.string().min(2, 'Company is required'),
    avatar: z.string().optional(),
    interestLevel: z.enum(['Hot Client', 'Great interest', 'Medium interest', 'Low interest', 'Non interest']).optional().default('Hot Client'),
    rating: z.coerce.number().min(1).max(5).optional().default(5),
    sources: z.array(z.string()).optional().default(['LinkedIn']),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    dealValue: z.coerce.number().optional().default(15000),
    status: z.enum(['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']).optional().default('New')
  })
};

module.exports = {
  createLeadSchema
};
