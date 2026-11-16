const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const env = require('../src/config/env');
const { autoSeedIfEmpty } = require('../src/seed/initSeed');

const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Holiday = require('../src/models/Holiday');
const AuditLog = require('../src/models/AuditLog');
const Notification = require('../src/models/Notification');
const CompanySettings = require('../src/models/CompanySettings');
const PayrollConfig = require('../src/models/PayrollConfig');

describe('Phase 6: Extra Features, Production Bootstrap & Employee Self-Service', () => {
  let adminToken, empToken;
  let adminUser, empUser, empDoc;

  beforeAll(async () => {
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Holiday.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({}),
      CompanySettings.deleteMany({}),
      PayrollConfig.deleteMany({})
    ]);

    // Verify production bootstrap creates only Super Admin + baseline settings (zero mock employees)
    await autoSeedIfEmpty();
    const empCountAfterBootstrap = await Employee.countDocuments();
    expect(empCountAfterBootstrap).toBe(0);

    adminUser = await User.findOne({ role: 'Admin' });
    expect(adminUser).toBeTruthy();

    empDoc = await Employee.create({
      name: 'Kiran SelfService',
      role: 'Analyst',
      department: 'Operations',
      email: 'kiran.ss@test.com',
      annualCtc: 500000,
      status: 'Active'
    });

    empUser = await User.create({
      name: 'Kiran SelfService',
      email: 'kiran.ss@test.com',
      password: 'Password123',
      role: 'Employee',
      employeeId: empDoc._id,
      isActive: true
    });

    adminToken = jwt.sign({ id: adminUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    empToken = jwt.sign({ id: empUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  });

  test('1. Employee can view and update own self-service profile (phone & emergencyContact)', async () => {
    const getRes = await request(app)
      .get('/api/employees/profile')
      .set('Authorization', `Bearer ${empToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.email).toBe('kiran.ss@test.com');

    const patchRes = await request(app)
      .patch('/api/employees/profile')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        phone: '+91 9876500000',
        emergencyContact: { name: 'Ravi', phone: '+91 9876511111', relation: 'Father' }
      });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.phone).toBe('+91 9876500000');
  });

  test('2. Employee can change own password via POST /api/auth/change-password', async () => {
    const badRes = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ currentPassword: 'WrongPassword1', newPassword: 'NewPassword123' });
    expect(badRes.status).toBe(400);

    const okRes = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ currentPassword: 'Password123', newPassword: 'NewPassword123' });
    expect(okRes.status).toBe(200);
  });

  test('3. Notifications can be fetched and marked as read', async () => {
    const notif = await Notification.create({
      userId: empUser._id,
      title: 'Payslip Ready',
      message: 'Your payslip is available.',
      type: 'payroll',
      link: '/my-payslips'
    });

    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${empToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.unreadCount).toBe(1);

    const readRes = await request(app)
      .patch(`/api/notifications/${notif._id}/read`)
      .set('Authorization', `Bearer ${empToken}`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.data.isRead).toBe(true);
  });

  test('4. Audit Logs are restricted to Admin/HR', async () => {
    await AuditLog.create({
      actorId: adminUser._id,
      actorName: adminUser.name,
      actorRole: 'Admin',
      action: 'PAYOUT_PAID',
      entityType: 'Payroll'
    });

    const empRes = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${empToken}`);
    expect(empRes.status).toBe(403);

    const adminRes = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.items.length).toBeGreaterThanOrEqual(1);
  });

  test('5. Holidays: Employee can view, only Admin/HR can create', async () => {
    const empCreate = await request(app)
      .post('/api/holidays')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ name: 'Test Holiday', date: '2026-08-15' });
    expect(empCreate.status).toBe(403);

    const adminCreate = await request(app)
      .post('/api/holidays')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Independence Day', date: '2026-08-15' });
    expect(adminCreate.status).toBe(201);

    const empList = await request(app)
      .get('/api/holidays')
      .set('Authorization', `Bearer ${empToken}`);
    expect(empList.status).toBe(200);
    expect(empList.body.data.length).toBe(1);
  });
});

