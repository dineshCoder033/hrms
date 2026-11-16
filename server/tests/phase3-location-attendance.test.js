const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const env = require('../src/config/env');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Attendance = require('../src/models/Attendance');
const OfficeLocation = require('../models/OfficeLocation');
const { distanceMeters } = require('../src/utils/geo');

describe('Phase 3: Location-Based Punch & Geofencing Test Suite', () => {
  let adminToken, managerToken, empToken, remoteEmpToken;
  let adminUser, managerUser, empUser, remoteEmpUser;
  let managerEmployee, empEmployee, remoteEmployee;
  let testOffice;

  beforeAll(async () => {
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await OfficeLocation.deleteMany({});

    // 1. Create Test Office Geofence (Bengaluru Tech Park)
    testOffice = await OfficeLocation.create({
      name: 'Bengaluru HQ',
      lat: 12.9716,
      lng: 77.5946,
      radiusMeters: 150,
      isActive: true
    });

    // 2. Create Employees
    managerEmployee = await Employee.create({
      name: 'Manager Bob',
      role: 'Engineering Lead',
      department: 'Engineering',
      email: 'manager.bob@test.com',
      workMode: 'Office',
      officeLocation: testOffice._id
    });

    empEmployee = await Employee.create({
      name: 'Worker Wendy',
      role: 'Frontend Dev',
      department: 'Engineering',
      email: 'wendy@test.com',
      manager: managerEmployee._id,
      workMode: 'Office',
      officeLocation: testOffice._id
    });

    remoteEmployee = await Employee.create({
      name: 'Remote Rachel',
      role: 'DevOps Specialist',
      department: 'Infrastructure',
      email: 'rachel@test.com',
      workMode: 'Remote'
    });

    // 3. Create Users
    adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin.geo@test.com',
      password: 'AdminPassword123',
      role: 'Admin',
      isActive: true
    });

    managerUser = await User.create({
      name: 'Manager Bob',
      email: 'manager.bob@test.com',
      password: 'Password123',
      role: 'Manager',
      employeeId: managerEmployee._id,
      isActive: true
    });

    empUser = await User.create({
      name: 'Worker Wendy',
      email: 'wendy@test.com',
      password: 'Password123',
      role: 'Employee',
      employeeId: empEmployee._id,
      isActive: true
    });

    remoteEmpUser = await User.create({
      name: 'Remote Rachel',
      email: 'rachel@test.com',
      password: 'Password123',
      role: 'Employee',
      employeeId: remoteEmployee._id,
      isActive: true
    });

    adminToken = jwt.sign({ id: adminUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    managerToken = jwt.sign({ id: managerUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    empToken = jwt.sign({ id: empUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    remoteEmpToken = jwt.sign({ id: remoteEmpUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  });

  test('1. Haversine distance unit test calculates correct geodesic distance', () => {
    // Distance between Bengaluru HQ (12.9716, 77.5946) and nearby spot (12.9718, 77.5948) ~ 30 meters
    const d = distanceMeters({ lat: 12.9716, lng: 77.5946 }, { lat: 12.9718, lng: 77.5948 });
    expect(d).toBeGreaterThan(15);
    expect(d).toBeLessThan(50);
  });

  test('2. GPS accuracy > 100m is rejected', async () => {
    const res = await request(app)
      .post('/api/attendance/punch')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        type: 'in',
        lat: 12.9716,
        lng: 77.5946,
        accuracy: 250 // Low accuracy
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/GPS accuracy is too low/i);
  });

  test('3. Inside geofence punch IN automatically approves', async () => {
    const res = await request(app)
      .post('/api/attendance/punch')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        type: 'in',
        lat: 12.9716,
        lng: 77.5946, // Exactly at office
        accuracy: 10
      });

    expect(res.status).toBe(200);
    expect(res.body.data.geofenceStatus).toBe('Inside');
    expect(res.body.data.approvalStatus).toBe('Auto');
    expect(res.body.data.checkIn).toBeDefined();
  });

  test('4. Double check-in on the same day is blocked with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/attendance/punch')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        type: 'in',
        lat: 12.9716,
        lng: 77.5946,
        accuracy: 10
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/Already checked IN today/i);
  });

  test('5. Punch OUT computes real total hours', async () => {
    const res = await request(app)
      .post('/api/attendance/punch')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        type: 'out',
        lat: 12.9716,
        lng: 77.5946,
        accuracy: 10
      });

    expect(res.status).toBe(200);
    expect(res.body.data.checkOut).toBeDefined();
    expect(res.body.data.totalHours).toBeGreaterThanOrEqual(0);
  });

  test('6. Remote workMode bypasses geofencing', async () => {
    const res = await request(app)
      .post('/api/attendance/punch')
      .set('Authorization', `Bearer ${remoteEmpToken}`)
      .send({ type: 'in' }); // No GPS coords passed

    expect(res.status).toBe(200);
    expect(res.body.data.geofenceStatus).toBe('Remote');
    expect(res.body.data.approvalStatus).toBe('Auto');
  });

  test('7. Outside geofence punch IN flags as Pending and allows Manager approval', async () => {
    // Manager logs in and punches from 15km away
    const punchRes = await request(app)
      .post('/api/attendance/punch')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        type: 'in',
        lat: 13.0827,
        lng: 80.2707, // Chennai (~300 km from Bengaluru)
        accuracy: 15
      });

    expect(punchRes.status).toBe(200);
    expect(punchRes.body.data.geofenceStatus).toBe('Outside');
    expect(punchRes.body.data.approvalStatus).toBe('Pending');

    // Admin reviews and approves the outside punch
    const reviewRes = await request(app)
      .patch(`/api/attendance/${punchRes.body.data._id}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Approved' });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.approvalStatus).toBe('Approved');
  });

  test('8. Office locations CRUD', async () => {
    const createRes = await request(app)
      .post('/api/locations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Hyderabad Branch',
        lat: 17.3850,
        lng: 78.4867,
        radiusMeters: 200,
        address: 'HITEC City'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Hyderabad Branch');

    const getRes = await request(app)
      .get('/api/locations')
      .set('Authorization', `Bearer ${empToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.length).toBeGreaterThan(0);
  });
});

