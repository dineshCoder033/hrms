const User = require('../models/User');
const CompanySettings = require('../models/CompanySettings');
const PayrollConfig = require('../models/PayrollConfig');
const env = require('../config/env');

/**
 * Production-safe bootstrap:
 * Only ensures the initial Super Admin account (from env) and baseline
 * CompanySettings / PayrollConfig singletons exist. No demo/mock records are seeded.
 */
const autoSeedIfEmpty = async () => {
  try {
    let admin = await User.findOne({ role: 'Admin' });
    const targetEmail = (env.ADMIN_EMAIL || 'admin@admin.com').toLowerCase();
    const targetPassword = env.ADMIN_PASSWORD || 'admin@123';

    if (!admin) {
      console.log('[TaskOrbit HRMS] Initializing Super Admin user from environment...');
      await User.create({
        name: 'Super Admin',
        email: targetEmail,
        password: targetPassword,
        role: 'Admin',
        isActive: true
      });
      console.log(`[TaskOrbit HRMS] Super Admin created: ${targetEmail}`);
    } else if (admin.email !== targetEmail) {
      // Sync Admin email & password with updated .env
      admin.email = targetEmail;
      admin.password = targetPassword;
      admin.failedLoginAttempts = 0;
      admin.lockUntil = undefined;
      admin.isActive = true;
      await admin.save();
      console.log(`[TaskOrbit HRMS] Super Admin updated to: ${targetEmail}`);
    }

    const companyCount = await CompanySettings.countDocuments();
    if (companyCount === 0) {
      await CompanySettings.create({
        name: 'TaskOrbit Technologies Pvt Ltd',
        address: 'Configure your company address in Payroll Settings',
        taxId: 'PENDING',
        currency: 'INR'
      });
    }

    const payrollConfigCount = await PayrollConfig.countDocuments();
    if (payrollConfigCount === 0) {
      await PayrollConfig.create({});
    }
  } catch (error) {
    console.error('[TaskOrbit HRMS] Bootstrap error:', error.message);
  }
};

module.exports = { autoSeedIfEmpty };
