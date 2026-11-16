const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const env = require('../src/config/env');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Leave = require('../src/models/Leave');
const Attendance = require('../src/models/Attendance');

describe('Phase 1 Security & RBAC Test Suite', () => {
  let adminToken, managerToken, empAToken, empBToken;
  let adminUser, managerUser, empAUser, empBUser;
  let managerEmployee, empAEmployee, empBEmployee;

  beforeAll(async () => {
    // Clean test collections
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Leave.deleteMany({});
    await Attendance.deleteMany({});

    // Create Employees
    managerEmployee = await Employee.create({
      name: 'Manager Mike',
      role: 'Engineering Manager',
      department: 'Engineering',
      email: 'manager.mike@test.com'
    });

    empAEmployee = await Employee.create({
      name: 'Employee Alice',
      role: 'Frontend Engineer',
      department: 'Engineering',
      email: 'alice@test.com',
      manager: managerEmployee._id
    });

    empBEmployee = await Employee.create({
      name: 'Employee Bob',
      role: 'Backend Engineer',
      department: 'Infrastructure',
      email: 'bob@test.com'
    });

    // Create Users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'AdminPassword123',
      role: 'Admin',
      isActive: true
    });

    managerUser = await User.create({
      name: 'Manager Mike',
      email: 'manager.mike@test.com',
      password: 'Password123',
      role: 'Manager',
      employeeId: managerEmployee._id,
      isActive: true
    });

    empAUser = await User.create({
      name: 'Employee Alice',
      email: 'alice@test.com',
      password: 'Password123',
      role: 'Employee',
      employeeId: empAEmployee._id,
      isActive: true
    });

    empBUser = await User.create({
      name: 'Employee Bob',
      email: 'bob@test.com',
      password: 'Password123',
      role: 'Employee',
      employeeId: empBEmployee._id,
      isActive: true
    });

    // Generate Tokens
    adminToken = jwt.sign({ id: adminUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    managerToken = jwt.sign({ id: managerUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    empAToken = jwt.sign({ id: empAUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    empBToken = jwt.sign({ id: empBUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  });

  test('1. Token missing on protected route -> 401 Unauthorized', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(401);
  });

  test('2. POST /api/auth/register route is completely removed -> 404', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Hacker', email: 'hack@test.com', password: 'Password123' });
    expect(res.status).toBe(404);
  });

  test('3. Deactivated user token -> 401 Unauthorized', async () => {
    await User.findByIdAndUpdate(empBUser._id, { isActive: false });

    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${empBToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Account inactive/i);

    // Re-activate
    await User.findByIdAndUpdate(empBUser._id, { isActive: true });
  });

  test('4. Manager cannot self-approve their own leave -> 403 Forbidden', async () => {
    const managerLeave = await Leave.create({
      employeeId: managerEmployee._id,
      employeeName: managerEmployee.name,
      leaveType: 'Casual Leave',
      startDate: '2026-06-10',
      endDate: '2026-06-11',
      daysCount: 2,
      reason: 'Personal time off',
      status: 'Pending'
    });

    const res = await request(app)
      .patch(`/api/leaves/${managerLeave._id}/status`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'Approved' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/cannot approve or reject your own leave/i);
  });

  test('5. Manager can approve team member leave, but not unmanaged employee leave', async () => {
    const aliceLeave = await Leave.create({
      employeeId: empAEmployee._id,
      employeeName: empAEmployee.name,
      leaveType: 'Sick Leave',
      startDate: '2026-06-15',
      endDate: '2026-06-16',
      daysCount: 2,
      reason: 'Fever',
      status: 'Pending'
    });

    const bobLeave = await Leave.create({
      employeeId: empBEmployee._id,
      employeeName: empBEmployee.name,
      leaveType: 'Sick Leave',
      startDate: '2026-06-15',
      endDate: '2026-06-16',
      daysCount: 2,
      reason: 'Fever',
      status: 'Pending'
    });

    // Manager approves Alice (in team) -> 200
    const resAlice = await request(app)
      .patch(`/api/leaves/${aliceLeave._id}/status`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'Approved' });
    expect(resAlice.status).toBe(200);

    // Manager tries to approve Bob (not in team) -> 403
    const resBob = await request(app)
      .patch(`/api/leaves/${bobLeave._id}/status`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'Approved' });
    expect(resBob.status).toBe(403);
  });

  test('6. Punch attendance always uses req.user.employeeId (ignores spoofed body)', async () => {
    const res = await request(app)
      .post('/api/attendance/punch')
      .set('Authorization', `Bearer ${empAToken}`)
      .send({ type: 'in', employeeId: empBEmployee._id.toString() }); // Alice tries to spoof Bob

    expect(res.status).toBe(200);
    expect(res.body.data.employeeId).toBe(empAEmployee._id.toString()); // Must be Alice!
  });

  test('7. Sensitive fields (salary) hidden from non-Admin/HR users', async () => {
    const resAlice = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${empAToken}`);

    expect(resAlice.status).toBe(200);
    expect(resAlice.body.data[0].salary).toBeUndefined();

    const resAdmin = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resAdmin.status).toBe(200);
    expect(resAdmin.body.data[0].salary).toBeDefined();
  });
});

