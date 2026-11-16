const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const env = require('../src/config/env');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Meeting = require('../src/models/Meeting');

describe('Phase 4: HR Meetings & Scheduling Test Suite', () => {
  let managerToken, empAToken, empBToken;
  let managerUser, empAUser, empBUser;
  let managerEmployee, empAEmployee, empBEmployee;

  beforeAll(async () => {
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Meeting.deleteMany({});

    managerEmployee = await Employee.create({
      name: 'Manager Sarah',
      role: 'Team Lead',
      department: 'Engineering',
      email: 'sarah.mgr@test.com'
    });

    empAEmployee = await Employee.create({
      name: 'Dev Alice',
      role: 'Developer',
      department: 'Engineering',
      email: 'alice.dev@test.com',
      manager: managerEmployee._id
    });

    empBEmployee = await Employee.create({
      name: 'Dev Bob',
      role: 'Developer',
      department: 'Engineering',
      email: 'bob.dev@test.com',
      manager: managerEmployee._id
    });

    managerUser = await User.create({
      name: 'Manager Sarah',
      email: 'sarah.mgr@test.com',
      password: 'Password123',
      role: 'Manager',
      employeeId: managerEmployee._id,
      isActive: true
    });

    empAUser = await User.create({
      name: 'Dev Alice',
      email: 'alice.dev@test.com',
      password: 'Password123',
      role: 'Employee',
      employeeId: empAEmployee._id,
      isActive: true
    });

    empBUser = await User.create({
      name: 'Dev Bob',
      email: 'bob.dev@test.com',
      password: 'Password123',
      role: 'Employee',
      employeeId: empBEmployee._id,
      isActive: true
    });

    managerToken = jwt.sign({ id: managerUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    empAToken = jwt.sign({ id: empAUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    empBToken = jwt.sign({ id: empBUser._id.toString() }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  });

  let createdMeetingId;

  test('1. Employee cannot create meetings -> 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${empAToken}`)
      .send({
        title: 'Unauthorized Sync',
        attendeeIds: [empBEmployee._id.toString()],
        startAt: '2026-12-01T10:00:00Z',
        endAt: '2026-12-01T11:00:00Z'
      });

    expect(res.status).toBe(403);
  });

  test('2. Manager schedules meeting successfully with auto-generated meetLink', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Sprint Planning',
        description: 'Q4 roadmap',
        attendeeIds: [empAEmployee._id.toString()],
        startAt: '2026-12-01T10:00:00Z',
        endAt: '2026-12-01T11:00:00Z',
        mode: 'Online'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Sprint Planning');
    expect(res.body.data.meetLink).toMatch(/^https:\/\/meet\.jit\.si\/taskorbit-/);
    createdMeetingId = res.body.data._id;
  });

  test('3. Overlapping meeting triggers 409 Conflict for busy participant', async () => {
    const res = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Conflicting Sync',
        attendeeIds: [empAEmployee._id.toString(), empBEmployee._id.toString()],
        startAt: '2026-12-01T10:30:00Z', // Overlaps 10:00-11:00
        endAt: '2026-12-01T11:30:00Z',
        mode: 'Online'
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/Participant conflict/i);
  });

  test('4. Attendee can RSVP Accepted / Declined', async () => {
    const res = await request(app)
      .post(`/api/meetings/${createdMeetingId}/respond`)
      .set('Authorization', `Bearer ${empAToken}`)
      .send({ response: 'Accepted' });

    expect(res.status).toBe(200);
    const aliceEntry = res.body.data.attendees.find(
      a => a.employee._id === empAEmployee._id.toString()
    );
    expect(aliceEntry.response).toBe('Accepted');
  });

  test('5. Download .ICS calendar invite returns text/calendar', async () => {
    const res = await request(app)
      .get(`/api/meetings/${createdMeetingId}/ics`)
      .set('Authorization', `Bearer ${empAToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/calendar/);
    expect(res.text).toContain('BEGIN:VCALENDAR');
    expect(res.text).toContain('SUMMARY:Sprint Planning');
  });

  test('6. Check availability returns booked slots for given date', async () => {
    const res = await request(app)
      .get(`/api/meetings/availability?employeeIds=${empAEmployee._id}&date=2026-12-01`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.bookedSlots.length).toBeGreaterThan(0);
    expect(res.body.data.bookedSlots[0].title).toBe('Sprint Planning');
  });

  test('7. Organizer can cancel meeting (soft delete)', async () => {
    const res = await request(app)
      .delete(`/api/meetings/${createdMeetingId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Cancelled');
  });
});

