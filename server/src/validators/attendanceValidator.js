const { z } = require('zod');

const punchSchema = {
  body: z.object({
    employeeId: z.string().optional(),
    type: z.enum(['in', 'out'], { required_error: "Punch type must be 'in' or 'out'" })
  })
};

module.exports = {
  punchSchema
};
