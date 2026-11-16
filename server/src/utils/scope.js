const Employee = require('../models/Employee');

/**
 * Scope filter helper to ensure data isolation based on role and manager hierarchy
 * - Admin / HR: Full visibility across the company
 * - Manager: Visibility into their managed team members + self
 * - Employee: Strictly their own records
 */
const employeeScope = async (user) => {
  if (!user) return { _id: null };

  if (['Admin', 'HR'].includes(user.role)) {
    return {}; // All records
  }

  if (user.role === 'Manager' && user.employeeId) {
    const team = await Employee.find({ manager: user.employeeId }).distinct('_id');
    return { employeeId: { $in: [...team, user.employeeId] } };
  }

  return { employeeId: user.employeeId || null };
};

module.exports = { employeeScope };

