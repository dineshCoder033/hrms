const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const mockData = require('./mockData');

const seedDatabase = async () => {
  const uri = env.MONGODB_URI;
  console.log(`[TaskOrbit HRMS Seed] Connecting to MongoDB: ${uri}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[TaskOrbit HRMS Seed] Connected successfully. Purging existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Task.deleteMany({}),
      Lead.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Payroll.deleteMany({})
    ]);

    // 1. Seed Employees
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
      skills: e.skills
    })));
    console.log(`[TaskOrbit HRMS Seed] Seeded ${createdEmployees.length} employees.`);

    // Set Manager hierarchy: First employee is CEO, next is manager for rest
    if (createdEmployees.length > 2) {
      const managerId = createdEmployees[1]._id;
      for (let i = 2; i < createdEmployees.length; i++) {
        createdEmployees[i].manager = managerId;
        await createdEmployees[i].save();
      }
    }

    // 2. Seed Super Admin User
    const adminUser = await User.create({
      name: 'Super Admin',
      email: (env.ADMIN_EMAIL || 'admin@taskorbit.com').toLowerCase(),
      password: env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'Admin',
      employeeId: createdEmployees[0]._id,
      isActive: true
    });
    console.log(`[TaskOrbit HRMS Seed] Seeded Super Admin: ${adminUser.email}`);

    // Seed additional demo users linked to employees
    if (createdEmployees.length > 1) {
      await User.create({
        name: createdEmployees[1].name,
        email: createdEmployees[1].email.toLowerCase(),
        password: 'Password@123',
        role: 'Manager',
        employeeId: createdEmployees[1]._id,
        isActive: true
      });

      await User.create({
        name: createdEmployees[2].name,
        email: createdEmployees[2].email.toLowerCase(),
        password: 'Password@123',
        role: 'Employee',
        employeeId: createdEmployees[2]._id,
        isActive: true
      });
      console.log(`[TaskOrbit HRMS Seed] Seeded Manager & Employee test accounts.`);
    }

    // 3. Seed Tasks
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

    // 4. Seed Leads
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

    // 5. Seed Attendance with valid ObjectId refs
    await Attendance.insertMany(mockData.attendance.map((a, i) => ({
      employeeId: createdEmployees[i % createdEmployees.length]._id,
      employeeName: a.employeeName,
      date: a.date,
      checkIn: a.checkIn,
      checkOut: a.checkOut,
      totalHours: a.totalHours,
      status: a.status,
      workType: a.workType
    })));

    // 6. Seed Leaves with valid ObjectId refs
    await Leave.insertMany(mockData.leaves.map((l, i) => ({
      employeeId: createdEmployees[i % createdEmployees.length]._id,
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

    // 7. Seed Payrolls with valid ObjectId refs
    await Payroll.insertMany(mockData.payrolls.map((p, i) => {
      const base = p.baseSalary || 65000;
      return {
        employeeId: createdEmployees[i % createdEmployees.length]._id,
        employeeName: p.employeeName,
        employeeRole: p.employeeRole,
        department: 'Engineering',
        month: p.month,
        grossSalary: base + (p.allowance || 0),
        basicPay: Math.round(base * 0.5),
        hra: Math.round(base * 0.3),
        specialAllowance: Math.round(base * 0.2),
        baseSalary: base,
        bonus: p.bonus || 0,
        allowance: p.allowance || 0,
        pfDeduction: Math.round(base * 0.06),
        taxDeduction: p.tax || 0,
        deductions: p.deductions || 0,
        tax: p.tax || 0,
        netPayable: p.netPayable,
        paymentStatus: p.paymentStatus,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod
      };
    }));

    console.log('[TaskOrbit HRMS Seed] Seeding completed successfully!');
  } catch (error) {
    console.error('[TaskOrbit HRMS Seed] Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('[TaskOrbit HRMS Seed] Database disconnected.');
  }
};

seedDatabase();
