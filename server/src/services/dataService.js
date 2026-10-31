const { getIsConnected } = require('../config/db');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const mockData = require('../seed/mockData');

// In-memory store fallback when MongoDB is unavailable
const memoryStore = {
  stats: { ...mockData.stats },
  schedule: { ...mockData.schedule },
  leads: [...mockData.leads],
  tasks: [...mockData.tasks],
  employees: [...mockData.employees],
  attendance: [...mockData.attendance],
  leaves: [...mockData.leaves],
  payrolls: [...mockData.payrolls],
  summaryWidget: { ...mockData.summaryWidget }
};

// Seed MongoDB if connected and collections are empty
const autoSeedMongoIfConnected = async () => {
  if (!getIsConnected()) return;
  try {
    const empCount = await Employee.countDocuments();
    if (empCount === 0) {
      console.log('[TaskOrbit HRMS] Seeding initial collections into MongoDB...');
      
      const createdEmployees = await Employee.insertMany(mockData.employees.map(e => ({
        name: e.name,
        role: e.role,
        department: e.department,
        email: e.email,
        phone: e.phone,
        avatar: e.avatar,
        salary: e.salary,
        status: e.status,
        joinDate: new Date(e.joinDate),
        location: e.location,
        performanceScore: e.performanceScore,
        skills: e.skills,
        reportsTo: e.reportsTo
      })));

      await Task.insertMany(mockData.tasks.map(t => ({
        title: t.title,
        clientName: t.clientName,
        clientRole: t.clientRole,
        clientAvatar: t.clientAvatar,
        taskType: t.taskType,
        scheduledDate: t.scheduledDate,
        scheduledTime: t.scheduledTime,
        status: t.status,
        category: t.category,
        amount: t.amount,
        isHighlight: t.isHighlight,
        attendees: t.attendees
      })));

      await Lead.insertMany(mockData.leads.map(l => ({
        name: l.name,
        role: l.role,
        company: l.company,
        avatar: l.avatar,
        interestLevel: l.interestLevel,
        rating: l.rating,
        sources: l.sources,
        email: l.email,
        phone: l.phone,
        dealValue: l.dealValue,
        status: l.status
      })));

      await Attendance.insertMany(mockData.attendance.map((a, i) => ({
        employeeId: createdEmployees[i % createdEmployees.length]._id.toString(),
        employeeName: a.employeeName,
        date: a.date,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
        totalHours: a.totalHours,
        status: a.status,
        workType: a.workType
      })));

      await Leave.insertMany(mockData.leaves.map((l, i) => ({
        employeeId: createdEmployees[i % createdEmployees.length]._id.toString(),
        employeeName: l.employeeName,
        employeeAvatar: l.employeeAvatar,
        leaveType: l.leaveType,
        startDate: l.startDate,
        endDate: l.endDate,
        daysCount: l.daysCount,
        reason: l.reason,
        status: l.status,
        appliedAt: new Date(),
        reviewedBy: l.reviewedBy
      })));

      await Payroll.insertMany(mockData.payrolls.map((p, i) => ({
        employeeId: createdEmployees[i % createdEmployees.length]._id.toString(),
        employeeName: p.employeeName,
        employeeRole: p.employeeRole,
        month: p.month,
        baseSalary: p.baseSalary,
        bonus: p.bonus,
        allowance: p.allowance,
        deductions: p.deductions,
        tax: p.tax,
        netPayable: p.netPayable,
        paymentStatus: p.paymentStatus,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod
      })));

      console.log('[TaskOrbit HRMS] All MongoDB Collections Seeded Successfully.');
    }
  } catch (err) {
    console.error('[TaskOrbit HRMS] Auto-seeding error:', err.message);
  }
};

module.exports = {
  memoryStore,
  autoSeedMongoIfConnected,
  getIsConnected
};
