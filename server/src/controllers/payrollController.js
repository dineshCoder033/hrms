const payrollService = require('../services/payrollService');

const getPayrolls = async (req, res, next) => {
  try {
    const data = await payrollService.getAllPayrolls(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const generateMonthlyRun = async (req, res, next) => {
  try {
    const { month } = req.body;
    const data = await payrollService.generateMonthlyPayrollRun(month);
    res.status(201).json({
      success: true,
      message: `Payroll run generated successfully for ${month || 'current month'}`,
      data
    });
  } catch (error) {
    next(error);
  }
};

const processAll = async (req, res, next) => {
  try {
    const { month } = req.body;
    const data = await payrollService.processAllPayrolls(month);
    res.json({
      success: true,
      message: 'All pending payrolls processed and locked successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getPayslip = async (req, res, next) => {
  try {
    const data = await payrollService.getPayslipById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayrolls,
  generateMonthlyRun,
  processAll,
  getPayslip
};
