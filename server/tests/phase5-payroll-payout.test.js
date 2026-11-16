const crypto = require('crypto');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const env = require('../src/config/env');
const { encrypt } = require('../src/utils/crypto');

const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Leave = require('../src/models/Leave');
const LeaveBalance = require('../src/models/LeaveBalance');
const Attendance = require('../src/models/Attendance');
const Holiday = require('../src/models/Holiday');
const Payroll = require('../src/models/Payroll');
const Payout = require('../src/models/Payout');
const CompanySettings = require('../src/models/CompanySettings');
const PayrollConfig = require('../src/models/PayrollConfig');

describe('Phase 5: Payroll Fixes & Direct Salary Payout Test Suite', () => {
  let admin1Token, admin2Token, hrToken, empToken;
  let admin1User, admin2User, hrUser, empUser;
  let empSuccess, empFail;

  beforeAll(async () => {
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Leave.deleteMany({}),
      LeaveBalance.deleteMany({}),
      Attendance.deleteMany({}),
      Holiday.deleteMany({}),
      Payroll.deleteMany({}),
      Payout.deleteMany({}),
      CompanySettings.deleteMany({}),
      PayrollConfig.deleteMany({})
    ]);

    await CompanySettings.create({
      name: 'Acme Tech Pvt Ltd',
      address: '100 Anna Salai, Chennai',
      taxId: 'TAN99887766',
      currency: 'INR'
    });

    empSuccess = await Employee.create({
      name: 'Alice Payout',
      role: 'Senior Engineer',
      department: 'Engineering',
      email: 'alice.pay@test.com',
      annualCtc: 1200000,
      status: 'Active',
      bank: {
        holderName: 'Alice Payout',
        accountNumberEnc: encrypt('123456789012'),
        ifsc: 'HDFC0001234',
        bankName: 'HDFC Bank'
      }
    });

    empFail = await Employee.create({
      name: 'Bob Failure',
      role: 'QA Engineer',
      department: 'Engineering',
      email: 'bob.fail@test.com',
      annualCtc: 600000,
      status: 'Active',
      bank: {
        holderName: 'Bob Failure',
        accountNumberEnc: encrypt('987654321098'),
        ifsc: 'FAIL000000',
        bankName: 'Test Fail Bank'
      }
    });

    admin1User = await User.create({
      name: 'Admin One',
      email: 'admin1.pay@test.com',
      password: 'Password123',
      role: 'Admin',
      isActive: true
    });

    admin2User = await User.create({
      name: 'Admin Two',
      email: 'admin2.pay@test.com',
      password: 'Password123',
      role: 'Admin',
      isActive: true
    });

    hrUser = await User.create({
      name: 'HR Lead',
      email: 'hr.pay@test.com',
      password: 'Password123',
      role: 'HR',
      isActive: true
    });

    empUser = await User.create({
      name: 'Alice Payout',
      email: 'alice.pay@test.com',
      password: 'Password123',
      role: 'Employee',
      employeeId: empSuccess._id,
      isActive: true
    });

    admin1Token = jwt.sign({ id: admin1User._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    admin2Token = jwt.sign({ id: admin2User._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    hrToken = jwt.sign({ id: hrUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    empToken = jwt.sign({ id: empUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  });

  test('1. LeaveBalance initializes with used: 0 across all leave types', async () => {
    const balance = await LeaveBalance.create({ employeeId: empSuccess._id, year: 2026 });
    expect(balance.casual.used).toBe(0);
    expect(balance.sick.used).toBe(0);
    expect(balance.earned.used).toBe(0);
    expect(balance.unpaid.used).toBe(0);
  });

  test('2. POST /api/payroll/generate requires strict YYYY-MM month format', async () => {
    const missing = await request(app)
      .post('/api/payroll/generate')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({});
    expect(missing.status).toBe(400);

    const invalid = await request(app)
      .post('/api/payroll/generate')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({ month: 'April 2026' });
    expect(invalid.status).toBe(400);
  });

  test('3. Month-filtered LOP & DB Holiday exclusion calculate workingDaysInMonth accurately', async () => {
    // April 2026 has 30 days: 4 Saturdays + 4 Sundays = 8 weekend days -> 22 weekdays.
    // Add 1 weekday Holiday in April 2026 (2026-04-14 is Tuesday) -> 21 working days.
    await Holiday.create({
      name: 'Tamil New Year',
      date: '2026-04-14',
      year: 2026,
      isOptional: false
    });

    // Unpaid leave in DIFFERENT month (March 2026) -> should be ignored for 2026-04
    await Leave.create({
      employeeId: empSuccess._id,
      leaveType: 'Unpaid',
      fromDate: '2026-03-10',
      toDate: '2026-03-12',
      days: 3,
      reason: 'Old month unpaid',
      status: 'Approved'
    });

    // Unpaid leave in TARGET month (April 2026): 1 day
    await Leave.create({
      employeeId: empSuccess._id,
      leaveType: 'Unpaid',
      fromDate: '2026-04-06',
      toDate: '2026-04-06',
      days: 1,
      reason: 'Personal unpaid day',
      status: 'Approved'
    });

    // Absent attendance in TARGET month (April 2026): 1 day
    await Attendance.create({
      employeeId: empSuccess._id,
      date: '2026-04-08',
      status: 'Absent'
    });

    const res = await request(app)
      .post('/api/payroll/generate')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({ month: '2026-04' });

    expect(res.status).toBe(201);
    const alicePayroll = await Payroll.findOne({ employeeId: empSuccess._id, month: '2026-04' });
    expect(alicePayroll).toBeTruthy();
    expect(alicePayroll.status).toBe('Draft');
    expect(alicePayroll.workingDaysInMonth).toBe(21);
    // 1 unpaid leave + 1 absent = 2 LOP days (March 3 days ignored)
    expect(alicePayroll.absentDays).toBe(2);
    expect(alicePayroll.lopDeduction).toBeGreaterThan(0);
  });

  test('4. Maker-checker enforcement & locking on payroll approval', async () => {
    const alicePayroll = await Payroll.findOne({ employeeId: empSuccess._id, month: '2026-04' });

    // HR cannot approve payroll
    const hrApprove = await request(app)
      .post('/api/payroll/approve')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({ month: '2026-04' });
    expect(hrApprove.status).toBe(403);

    // Admin1 generates a payroll for 2026-05 and tries to self-approve -> 403 Maker-Checker Violation
    await request(app)
      .post('/api/payroll/generate')
      .set('Authorization', `Bearer ${admin1Token}`)
      .send({ month: '2026-05' });

    const selfApprove = await request(app)
      .post('/api/payroll/approve')
      .set('Authorization', `Bearer ${admin1Token}`)
      .send({ month: '2026-05' });
    expect(selfApprove.status).toBe(403);

    // Admin1 CAN approve 2026-04 (generated by HR)
    const validApprove = await request(app)
      .post('/api/payroll/approve')
      .set('Authorization', `Bearer ${admin1Token}`)
      .send({ month: '2026-04' });
    expect(validApprove.status).toBe(200);

    const lockedPayroll = await Payroll.findById(alicePayroll._id);
    expect(lockedPayroll.status).toBe('Approved');
    expect(lockedPayroll.isLocked).toBe(true);

    // Editing a locked/approved payroll is blocked -> 403
    const editLocked = await request(app)
      .patch(`/api/payroll/${alicePayroll._id}`)
      .set('Authorization', `Bearer ${admin2Token}`)
      .send({ bonus: 5000 });
    expect(editLocked.status).toBe(403);
  });

  test('5. Direct payout execution handles success and FAIL000000 failure atomically', async () => {
    const res = await request(app)
      .post('/api/payroll/payout')
      .set('Authorization', `Bearer ${admin2Token}`)
      .send({ month: '2026-04', provider: 'MockProvider' });

    expect(res.status).toBe(200);

    const alicePayroll = await Payroll.findOne({ employeeId: empSuccess._id, month: '2026-04' });
    const bobPayroll = await Payroll.findOne({ employeeId: empFail._id, month: '2026-04' });

    expect(alicePayroll.status).toBe('Paid');
    expect(bobPayroll.status).toBe('Failed');
    expect(bobPayroll.failureReason).toBeTruthy();

    const payouts = await Payout.find({ month: '2026-04' });
    expect(payouts.length).toBe(2);
  });

  test('6. Payout webhook verifies HMAC-SHA256 signature and processes idempotently', async () => {
    const bobPayout = await Payout.findOne({ employeeId: empFail._id, month: '2026-04' });
    const payload = JSON.stringify({
      providerRef: bobPayout.providerRef,
      status: 'Paid'
    });

    // Missing or invalid signature -> 401
    const badSig = await request(app)
      .post('/api/webhooks/payout')
      .set('Content-Type', 'application/json')
      .set('x-payout-signature', 'invalid-signature')
      .send(payload);
    expect(badSig.status).toBe(401);

    // Valid HMAC-SHA256 signature -> 200
    const secret = process.env.PAYOUT_WEBHOOK_SECRET || env.JWT_REFRESH_SECRET;
    const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const goodRes = await request(app)
      .post('/api/webhooks/payout')
      .set('Content-Type', 'application/json')
      .set('x-payout-signature', validSig)
      .send(payload);
    expect(goodRes.status).toBe(200);

    const updatedBobPayroll = await Payroll.findById(bobPayout.payrollId);
    expect(updatedBobPayroll.status).toBe('Paid');

    // Duplicate webhook call is idempotent -> 200 without duplicating state
    const dupRes = await request(app)
      .post('/api/webhooks/payout')
      .set('Content-Type', 'application/json')
      .set('x-payout-signature', validSig)
      .send(payload);
    expect(dupRes.status).toBe(200);
  });

  test('7. Payslip endpoint returns dynamic CompanySettings', async () => {
    const alicePayroll = await Payroll.findOne({ employeeId: empSuccess._id, month: '2026-04' });

    const res = await request(app)
      .get(`/api/payroll/${alicePayroll._id}/payslip`)
      .set('Authorization', `Bearer ${empToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.company.name).toBe('Acme Tech Pvt Ltd');
    expect(res.body.data.company.taxId).toBe('TAN99887766');
    expect(res.body.data.payslipNumber).toContain('PS-2026-04');
  });
});

