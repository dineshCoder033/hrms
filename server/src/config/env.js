require('dotenv').config();
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CLIENT_URL: z
    .string()
    .min(1, 'CLIENT_URL is required')
    .default('http://localhost:5173')
    .refine(
      (val) =>
        val
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean)
          .every((u) => {
            try {
              new URL(u);
              return true;
            } catch {
              return false;
            }
          }),
      'CLIENT_URL must be a valid URL or comma-separated list of valid URLs'
    ),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COMPANY_TZ: z.string().default('Asia/Kolkata'),
  FIELD_ENCRYPTION_KEY: z.string().length(64, 'FIELD_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)'),
  ADMIN_EMAIL: z.string().email().default('admin@taskorbit.com'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin@12345')
});

try {
  module.exports = schema.parse(process.env);
} catch (error) {
  console.error('❌ Environment validation failed:');
  if (error.issues) {
    error.issues.forEach(issue => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
  } else {
    console.error(error.message);
  }
  process.exit(1);
}
