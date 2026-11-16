const payrollService = require('../services/payrollService');
const CompanySettings = require('../models/CompanySettings');
const PayrollConfig = require('../models/PayrollConfig');
const ApiError = require('../errors/ApiError');

const getPayrolls = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'Employee') {
      if (!req.user.employeeId) {
        throw ApiError.badRequest('No linked employee profile found.');
      }
      filter.employeeId = req.user.employeeId;
    } else if (req.query.employeeId) {
      filter.employeeId = req.query.employeeId;
    }

    if (req.query.month) filter.month = req.query.month;
    if (req.query.status) filter.status = req.query.status;

    const data = await payrollService.getAllPayrolls(filter);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const generateMonthlyRun = async (req, res, next) => {
  try {
    const { month } = req.body;
    const data = await payrollService.generateMonthlyPayrollRun(month, req.user);
    res.status(201).json({
      success: true,
      message: `Draft payroll run generated for ${month}`,
      data
    });
  } catch (error) {
    next(error);
  }
};

const updateDraft = async (req, res, next) => {
  try {
    const data = await payrollService.updateDraftPayroll(req.params.id, req.body);
    res.json({ success: true, message: 'Draft payroll updated', data });
  } catch (error) {
    next(error);
  }
};

const approveRun = async (req, res, next) => {
  try {
    const { month } = req.body;
    const data = await payrollService.approvePayrollRun(month, req.user);
    res.json({
      success: true,
      message: `Payroll run for ${month} approved and locked`,
      data
    });
  } catch (error) {
    next(error);
  }
};

const executePayouts = async (req, res, next) => {
  try {
    const { month, provider } = req.body;
    const data = await payrollService.executePayouts(month, req.user, provider);
    res.json({
      success: true,
      message: `Direct salary payouts processed for ${month}`,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getPayslip = async (req, res, next) => {
  try {
    const data = await payrollService.getPayslipById(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getSettings = async (req, res, next) => {
  try {
    let [company, config] = await Promise.all([
      CompanySettings.findOne({ key: 'default' }),
      PayrollConfig.findOne({ key: 'default' })
    ]);
    if (!company) company = await CompanySettings.create({ key: 'default' });
    if (!config) config = await PayrollConfig.create({ key: 'default' });
    res.json({ success: true, data: { company, config } });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { company, config } = req.body;
    if (company) {
      await CompanySettings.findOneAndUpdate({ key: 'default' }, company, { upsert: true });
    }
    if (config) {
      await PayrollConfig.findOneAndUpdate({ key: 'default' }, config, { upsert: true });
    }
    res.json({ success: true, message: 'Payroll and company settings updated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayrolls,
  generateMonthlyRun,
  updateDraft,
  approveRun,
  executePayouts,
  getPayslip,
  getSettings,
  updateSettings
};
