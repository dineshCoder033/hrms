const mongoose = require('mongoose');
const env = require('../src/config/env');
const User = require('../src/models/User');

async function updateAdminCredentials() {
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to MongoDB Atlas.');

    const newEmail = 'admin@admin.com';
    const newPassword = 'admin@123';

    // Find existing Admin user or create new
    let admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      admin = new User({
        name: 'Super Admin',
        email: newEmail,
        password: newPassword,
        role: 'Admin',
        isActive: true
      });
      await admin.save();
      console.log(`✅ Created fresh Admin: ${newEmail}`);
    } else {
      admin.email = newEmail;
      admin.password = newPassword; // Mongoose pre-save hook will bcrypt hash this automatically
      admin.failedLoginAttempts = 0;
      admin.lockUntil = undefined;
      admin.isActive = true;
      await admin.save();
      console.log(`✅ Updated existing Admin credentials to:`);
      console.log(`   - Email   : ${newEmail}`);
      console.log(`   - Password: ${newPassword}`);
    }

    // Verify password comparison works
    const checkUser = await User.findOne({ email: newEmail }).select('+password');
    const isMatch = await checkUser.comparePassword(newPassword);
    console.log(`✅ Password Verification check: ${isMatch ? 'SUCCESS' : 'FAILED'}`);

  } catch (err) {
    console.error('Error updating admin:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateAdminCredentials();
