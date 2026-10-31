require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const mockData = require('./mockData');

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms';
  console.log(`Connecting to MongoDB at: ${uri}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully. Seeding database collections...');

    // Clear existing collections
    await Promise.all([
      Employee.deleteMany({}),
      Task.deleteMany({}),
      Lead.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Payroll.deleteMany({})
    ]);
    console.log('Cleared existing collections.');

    // Seed Employees
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
    console.log(`Seeded ${createdEmployees.length} employees.`);

    // Seed Tasks
    const createdTasks = await Task.insertMany(mockData.tasks.map(t => ({
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
    console.log(`Seeded ${createdTasks.length} tasks.`);

    // Seed Leads
    const createdLeads = await Lead.insertMany(mockData.leads.map(l => ({
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
    console.log(`Seeded ${createdLeads.length} leads.`);

    // Seed Attendance
    const createdAttendance = await Attendance.insertMany(mockData.attendance.map((a, i) => ({
      employeeId: createdEmployees[i % createdEmployees.length]._id.toString(),
      employeeName: a.employeeName,
      date: a.date,
      checkIn: a.checkIn,
      checkOut: a.checkOut,
      totalHours: a.totalHours,
      status: a.status,
      workType: a.workType
    })));
    console.log(`Seeded ${createdAttendance.length} attendance records.`);

    // Seed Leaves
    const createdLeaves = await Leave.insertMany(mockData.leaves.map((l, i) => ({
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
    console.log(`Seeded ${createdLeaves.length} leave records.`);

    // Seed Payrolls
    const createdPayrolls = await Payroll.insertMany(mockData.payrolls.map((p, i) => ({
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
    console.log(`Seeded ${createdPayrolls.length} payroll records.`);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedDatabase();
