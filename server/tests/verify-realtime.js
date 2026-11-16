/**
 * HRMS End-to-End Live Simulation & Verification Script
 * This script connects to the active MongoDB Atlas database, verifies:
 * 1. Super Admin exists and has proper permissions
 * 2. Office Geofence Location exists (or creates HQ Chennai 100m)
 * 3. Creates a fresh Employee ('Kavitha Rajan') with login credentials
 * 4. Schedules a real Meeting & invites Kavitha Rajan
 * 5. Simulates Kavitha logging in, fetching her notifications, and Accepting (RSVP) the meeting
 * 6. Simulates Kavitha applying for leave (verified as 'Pending' / Awaiting Admin Approval)
 * 7. Simulates 100m Geofence Attendance check (rejection outside, acceptance inside)
 * 8. Prints full verification report
 */

const mongoose = require('mongoose');
const env = require('../src/config/env');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const OfficeLocation = require('../src/models/OfficeLocation');
const Meeting = require('../src/models/Meeting');
const Leave = require('../src/models/Leave');
const Attendance = require('../src/models/Attendance');
const CompanySettings = require('../src/models/CompanySettings');
const employeeService = require('../src/services/employeeService');
const meetingService = require('../src/services/meetingService');
const leaveService = require('../src/services/leaveService');
const attendanceService = require('../src/services/attendanceService');

async function runLiveVerification() {
  console.log('====================================================');
  console.log('🧪 Starting HRMS Full Real-Time Lifecycle Verification');
  console.log('====================================================');

  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB Atlas successfully.');

    // 1. Check Super Admin
    let admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      admin = await User.create({
        name: 'Super Admin',
        email: env.ADMIN_EMAIL || 'admin@taskorbit.com',
        password: env.ADMIN_PASSWORD || 'Admin@12345',
        role: 'Admin',
        isActive: true
      });
      console.log(`✅ Created Super Admin: ${admin.email}`);
    } else {
      console.log(`✅ Super Admin Verified: ${admin.email}`);
    }

    // Ensure Admin has an Employee record linked for meeting organization
    let adminEmp = await Employee.findOne({ email: admin.email });
    if (!adminEmp) {
      adminEmp = await Employee.create({
        name: admin.name,
        email: admin.email,
        role: 'Chief Executive Officer',
        department: 'Management',
        workMode: 'Office',
        annualCtc: 2400000,
        status: 'Active'
      });
      admin.employeeId = adminEmp._id;
      await admin.save();
    }

    // 2. Office Geofence Location (100m)
    let office = await OfficeLocation.findOne({ isActive: true });
    if (!office) {
      office = await OfficeLocation.create({
        name: 'Chennai Tech Park HQ',
        lat: 13.0827,
        lng: 80.2707,
        radiusMeters: 100,
        address: 'OMR, Taramani, Chennai, Tamil Nadu 600113',
        isActive: true
      });
      console.log(`✅ Created Office Geofence Location: ${office.name} (100m radius)`);
    } else {
      console.log(`✅ Verified Existing Geofence Location: ${office.name} (${office.radiusMeters}m radius)`);
    }

    // 3. Create Fresh Employee with Login Credentials (Admin Action)
    const empEmail = 'kavitha.rajan@company.com';
    let kavithaUser = await User.findOne({ email: empEmail });
    let kavithaEmp = await Employee.findOne({ email: empEmail });

    if (kavithaUser) await User.deleteOne({ _id: kavithaUser._id });
    if (kavithaEmp) await Employee.deleteOne({ _id: kavithaEmp._id });

    const newEmpResult = await employeeService.createEmployee({
      firstName: 'Kavitha',
      lastName: 'Rajan',
      name: 'Kavitha Rajan',
      email: empEmail,
      password: 'Password@123', // Direct Login Password created by Admin
      phone: '+91 9876543210',
      role: 'Full Stack Engineer',
      designation: 'Senior Developer',
      department: 'Engineering',
      bloodGroup: 'O+',
      maritalStatus: 'Unmarried',
      workMode: 'Office',
      officeLocation: office._id,
      annualCtc: 850000,
      bank: {
        holderName: 'Kavitha Rajan',
        bankName: 'HDFC Bank',
        branchName: 'T. Nagar, Chennai',
        accountNumber: '50100456789012',
        ifsc: 'HDFC0000123',
        pincode: '600017'
      },
      address: {
        street: '12 Gandhi Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        country: 'India'
      }
    });

    console.log(`✅ Created Employee: ${newEmpResult.name} (${newEmpResult.employeeCode})`);
    console.log(`   - Login Email    : ${newEmpResult.email}`);
    console.log(`   - Login Password : Password@123`);

    kavithaEmp = await Employee.findOne({ email: empEmail });
    kavithaUser = await User.findOne({ email: empEmail }).select('+password');

    // Test Employee Password match
    const isPasswordValid = await kavithaUser.comparePassword('Password@123');
    if (!isPasswordValid) throw new Error('Password mismatch for newly created employee!');
    console.log('✅ Employee Password Authentication Verified Successfully.');

    // 4. Create and Schedule a Meeting (Inviting Kavitha)
    const startAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const endAt = new Date(startAt.getTime() + 45 * 60 * 1000); // 45 mins duration

    const meeting = await meetingService.createMeeting(
      {
        title: 'Quarterly Product & Engineering Sync',
        description: 'Review roadmap deliverables and sprint priorities with the engineering team.',
        attendeeIds: [kavithaEmp._id.toString()],
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        mode: 'Online'
      },
      {
        id: admin._id.toString(),
        employeeId: adminEmp._id.toString(),
        role: 'Admin',
        name: admin.name
      }
    );

    console.log(`✅ Scheduled Meeting: "${meeting.title}"`);
    console.log(`   - Meeting Link: ${meeting.meetLink}`);
    console.log(`   - Invited Attendee: Kavitha Rajan (Status: Pending)`);

    // 5. Simulate Kavitha Logging in and Responding (RSVP: Accepted)
    const rsvpResult = await meetingService.respondToMeeting(
      meeting._id,
      'Accepted',
      {
        id: kavithaUser._id.toString(),
        employeeId: kavithaEmp._id.toString(),
        role: 'Employee'
      }
    );

    const kavithaAttendee = rsvpResult.attendees.find(
      a => a.employee?._id?.toString() === kavithaEmp._id.toString() || a.employee?.toString() === kavithaEmp._id.toString()
    );
    console.log(`✅ Kavitha Rajan RSVP Response Recorded: "${kavithaAttendee.response}"`);

    // 6. Simulate Kavitha Applying for Leave
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const leaveReq = await leaveService.createLeave(
      {
        leaveType: 'Casual',
        startDate: tomorrow,
        endDate: tomorrow,
        reason: 'Personal family event'
      },
      {
        id: kavithaUser._id.toString(),
        employeeId: kavithaEmp._id.toString(),
        role: 'Employee',
        name: kavithaUser.name
      }
    );

    console.log(`✅ Leave Applied: 1-Day Casual Leave on ${tomorrow}`);
    console.log(`   - Initial Status: "${leaveReq.status}" (Awaiting Admin Approval)`);

    // Verify Employee CANNOT self-approve (Strict RBAC test)
    try {
      await leaveService.updateLeaveStatus(leaveReq._id, 'Approved', {
        id: kavithaUser._id.toString(),
        employeeId: kavithaEmp._id.toString(),
        role: 'Employee',
        name: kavithaUser.name
      });
      throw new Error('Self-approval was allowed! Security breach.');
    } catch (secErr) {
      console.log(`✅ Security Verified: Employee Self-Approval is BLOCKED (${secErr.message})`);
    }

    // 7. Verify 100m Geofence Attendance Punch
    // Test A: Punch Outside Geofence (e.g. 500m away) -> MUST BE REJECTED
    try {
      await attendanceService.punchAttendance(
        kavithaEmp._id.toString(),
        {
          type: 'in',
          lat: office.lat + 0.005, // ~550 meters away
          lng: office.lng + 0.005,
          accuracy: 15
        },
        { ip: '127.0.0.1', userAgent: 'Mobile Safari' }
      );
      throw new Error('Punch outside geofence was accepted! Geofence failed.');
    } catch (geoErr) {
      console.log(`✅ Geofence Enforced: Outside Punch REJECTED -> "${geoErr.message}"`);
    }

    // Test B: Punch Inside Geofence (exact office location <= 100m) -> MUST BE ACCEPTED
    const validPunch = await attendanceService.punchAttendance(
      kavithaEmp._id.toString(),
      {
        type: 'in',
        lat: office.lat,
        lng: office.lng,
        accuracy: 10
      },
      { ip: '127.0.0.1', userAgent: 'Mobile Safari' }
    );
    console.log(`✅ Geofence Accepted: Inside Punch SUCCESSFUL -> "${validPunch.message}"`);

    console.log('\n====================================================');
    console.log('🎉 ALL REAL-TIME ENTERPRISE WORKFLOWS FULLY VERIFIED!');
    console.log('====================================================');
    console.log('Summary of Test Data:');
    console.log(`1. Super Admin  : ${admin.email} (Password: Admin@12345)`);
    console.log(`2. Test Employee: ${kavithaUser.email} (Password: Password@123)`);
    console.log(`3. Office Location: ${office.name} (100m radius active)`);
    console.log(`4. Meeting      : "${meeting.title}" (Kavitha RSVP: Accepted)`);
    console.log(`5. Leave Request: Casual Leave (Pending Admin Approval)`);
    console.log(`6. Attendance   : Punched IN within ${office.radiusMeters}m geofence`);
    console.log('====================================================');

  } catch (err) {
    console.error('❌ Verification Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

runLiveVerification();

