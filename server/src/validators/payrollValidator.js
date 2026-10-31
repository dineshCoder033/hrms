const { z } = require('zod');

const processPayrollSchema = {
  body: z.object({
    month: z.string().optional()
  }).optional()
};

module.exports = {
  processPayrollSchema
};
