const express = require('express');
const router = express.Router();
const { memoryStore, getIsConnected } = require('../services/dataService');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

// --- STATS & OVERVIEW ---
router.get('/stats', async (req, res) => {
  try {
    if (getIsConnected()) {
      const [empCount, pendingLeaves, payrolls, attendanceToday] = await Promise.all([
        Employee.countDocuments(),
        Leave.countDocuments({ status: 'Pending' }),
        Payroll.find(),
        Attendance.find({ date: new Date().toISOString().split('T')[0] })
      ]);

      const totalPayroll = payrolls.reduce((acc, curr) => acc + (curr.netPayable || 0), 0);
      const presentCount = attendanceToday.filter(a => a.status === 'Present').length;
      const attendanceRate = empCount > 0 ? Number(((presentCount / empCount) * 100).toFixed(1)) : 96.4;

      return res.json({
        success: true,
        data: {
          totalDeals: memoryStore.stats.totalDeals,
          dealsChange: memoryStore.stats.dealsChange,
          wonDeals: memoryStore.stats.wonDeals,
          wonChange: memoryStore.stats.wonChange,
          lostDeals: memoryStore.stats.lostDeals,
          lostChange: memoryStore.stats.lostChange,
          activeEmployees: empCount,
          totalPayroll: totalPayroll || memoryStore.stats.totalPayroll,
          attendanceRate: attendanceRate > 0 ? attendanceRate : 96.4,
          pendingLeaves
        }
      });
    }

    res.json({ success: true, data: memoryStore.stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- SCHEDULE ---
router.get('/schedule', (req, res) => {
  res.json({ success: true, data: memoryStore.schedule });
});

// --- LEADS / CANDIDATES ---
router.get('/leads', async (req, res) => {
  try {
    if (getIsConnected()) {
      const leads = await Lead.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: leads });
    }
    res.json({ success: true, data: memoryStore.leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/leads', async (req, res) => {
  try {
    if (getIsConnected()) {
      const created = await Lead.create(req.body);
      return res.status(201).json({ success: true, data: created });
    }

    const newLead = {
      id: `lead-${Date.now()}`,
      name: req.body.name || 'New Candidate',
      role: req.body.role || 'Specialist',
      company: req.body.company || 'InnovateCo',
      avatar: req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      interestLevel: req.body.interestLevel || 'Hot Client',
      rating: req.body.rating || 5,
      sources: req.body.sources || ['LinkedIn'],
      email: req.body.email || 'lead@example.com',
      dealValue: req.body.dealValue || 20000,
      status: 'New'
    };
    memoryStore.leads.unshift(newLead);
    res.status(201).json({ success: true, data: newLead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- TASKS ---
router.get('/tasks', async (req, res) => {
  try {
    if (getIsConnected()) {
      const tasks = await Task.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: tasks });
    }
    res.json({ success: true, data: memoryStore.tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    if (getIsConnected()) {
      const created = await Task.create(req.body);
      return res.status(201).json({ success: true, data: created });
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: req.body.title || 'Team Sync Call',
      clientName: req.body.clientName || 'Team Member',
      clientRole: req.body.clientRole || 'Product Lead',
      clientAvatar: req.body.clientAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      taskType: req.body.taskType || 'Google Meet Call',
      scheduledDate: req.body.scheduledDate || 'Today',
      scheduledTime: req.body.scheduledTime || '4:00 pm',
      status: req.body.status || 'Call scheduled',
      category: req.body.category || 'Due Today',
      amount: req.body.amount || null,
      isHighlight: false,
      attendees: req.body.attendees || []
    };
    memoryStore.tasks.push(newTask);
    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (getIsConnected()) {
      const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });
      if (updated) return res.json({ success: true, data: updated });
    }

    const task = memoryStore.tasks.find(t => t.id === id || t._id?.toString() === id);
    if (task) {
      Object.assign(task, req.body);
      return res.json({ success: true, data: task });
    }
    res.status(404).json({ success: false, message: 'Task not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- EMPLOYEES ---
router.get('/employees', async (req, res) => {
  try {
    if (getIsConnected()) {
      const employees = await Employee.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: employees });
    }
    res.json({ success: true, data: memoryStore.employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const empData = {
      name: req.body.name,
      role: req.body.role,
      department: req.body.department || 'Engineering',
      email: req.body.email,
      phone: req.body.phone || '+1 (555) 000-0000',
      avatar: req.body.avatar || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random()*100)}?w=200&auto=format&fit=crop&q=80`,
      salary: Number(req.body.salary) || 75000,
      status: req.body.status || 'Active',
      joinDate: req.body.joinDate ? new Date(req.body.joinDate) : new Date(),
      location: req.body.location || 'Remote, HQ',
      performanceScore: Math.floor(Math.random() * 10) + 90,
      skills: req.body.skills ? (Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',').map(s => s.trim())) : ['Problem Solving', 'Team Leadership'],
      reportsTo: req.body.reportsTo || 'CEO'
    };

    if (getIsConnected()) {
      const created = await Employee.create(empData);
      return res.status(201).json({ success: true, data: created });
    }

    const newEmployee = { ...empData, id: `emp-${Date.now()}` };
    memoryStore.employees.unshift(newEmployee);
    res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- ATTENDANCE ---
router.get('/attendance', async (req, res) => {
  try {
    if (getIsConnected()) {
      const attendance = await Attendance.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: attendance });
    }
    res.json({ success: true, data: memoryStore.attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/attendance/punch', async (req, res) => {
  const { employeeId, type } = req.body; // 'in' or 'out'
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const today = new Date().toISOString().split('T')[0];

  try {
    if (getIsConnected()) {
      let record = await Attendance.findOne({ date: today });
      if (!record) {
        // Find default or requested employee
        const emp = employeeId ? await Employee.findById(employeeId) : await Employee.findOne();
        record = await Attendance.create({
          employeeId: emp ? emp._id.toString() : (employeeId || 'emp-1'),
          employeeName: emp ? emp.name : 'Sophia Martinez',
          date: today,
          checkIn: time,
          checkOut: '-',
          totalHours: 0,
          status: 'Present',
          workType: 'Office'
        });
      } else {
        if (type === 'out') {
          record.checkOut = time;
          record.totalHours = 8.5;
        } else {
          record.checkIn = time;
        }
        await record.save();
      }
      return res.json({ success: true, data: record, message: `Punched ${type === 'out' ? 'Out' : 'In'} successfully at ${time}` });
    }

    let record = memoryStore.attendance.find(a => a.date === today);
    if (!record) {
      record = {
        id: `att-${Date.now()}`,
        employeeId: employeeId || 'emp-1',
        employeeName: 'Sophia Martinez',
        date: today,
        checkIn: time,
        checkOut: '-',
        totalHours: 0,
        status: 'Present',
        workType: 'Office'
      };
      memoryStore.attendance.unshift(record);
    } else {
      if (type === 'out') {
        record.checkOut = time;
        record.totalHours = 8.5;
      } else {
        record.checkIn = time;
      }
    }

    res.json({ success: true, data: record, message: `Punched ${type === 'out' ? 'Out' : 'In'} successfully at ${time}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- LEAVES ---
router.get('/leaves', async (req, res) => {
  try {
    if (getIsConnected()) {
      const leaves = await Leave.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: leaves });
    }
    res.json({ success: true, data: memoryStore.leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/leaves', async (req, res) => {
  try {
    const leaveData = {
      employeeId: req.body.employeeId || 'emp-1',
      employeeName: req.body.employeeName || 'Sophia Martinez',
      employeeAvatar: req.body.employeeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      leaveType: req.body.leaveType || 'Casual Leave',
      startDate: req.body.startDate || new Date().toISOString().split('T')[0],
      endDate: req.body.endDate || new Date().toISOString().split('T')[0],
      daysCount: Number(req.body.daysCount) || 1,
      reason: req.body.reason || 'Personal time-off',
      status: 'Pending',
      appliedAt: new Date()
    };

    if (getIsConnected()) {
      const created = await Leave.create(leaveData);
      return res.status(201).json({ success: true, data: created });
    }

    const newLeave = { ...leaveData, id: `lev-${Date.now()}` };
    memoryStore.leaves.unshift(newLeave);
    res.status(201).json({ success: true, data: newLeave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/leaves/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (getIsConnected()) {
      const updated = await Leave.findByIdAndUpdate(id, { status: req.body.status }, { new: true });
      if (updated) return res.json({ success: true, data: updated });
    }

    const leave = memoryStore.leaves.find(l => l.id === id || l._id?.toString() === id);
    if (leave) {
      if (req.body.status) leave.status = req.body.status;
      return res.json({ success: true, data: leave });
    }
    res.status(404).json({ success: false, message: 'Leave request not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- PAYROLL ---
router.get('/payroll', async (req, res) => {
  try {
    if (getIsConnected()) {
      const payrolls = await Payroll.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: payrolls });
    }
    res.json({ success: true, data: memoryStore.payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/payroll/pay-all', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    if (getIsConnected()) {
      await Payroll.updateMany(
        { paymentStatus: { $ne: 'Paid' } },
        { paymentStatus: 'Paid', paymentDate: today }
      );
      const updated = await Payroll.find();
      return res.json({ success: true, message: 'All pending payrolls processed successfully', data: updated });
    }

    memoryStore.payrolls.forEach(p => {
      p.paymentStatus = 'Paid';
      p.paymentDate = today;
    });
    res.json({ success: true, message: 'All pending payrolls processed successfully', data: memoryStore.payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- SUMMARY WIDGET ---
router.get('/summary', (req, res) => {
  res.json({ success: true, data: memoryStore.summaryWidget });
});

router.patch('/summary/goal', (req, res) => {
  if (req.body.description) {
    memoryStore.summaryWidget.goal.description = req.body.description;
  }
  res.json({ success: true, data: memoryStore.summaryWidget.goal });
});

module.exports = router;
