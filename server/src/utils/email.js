const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Real SMTP Configuration (Gmail, SendGrid, Amazon SES, Brevo, Hostinger etc.)
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log(`[TaskOrbit HRMS] Live SMTP connected: ${process.env.SMTP_HOST}`);
  } else {
    // Development fallback mock transporter (logs email neatly to console without crashing)
    transporter = {
      sendMail: async (options) => {
        console.log(`[TaskOrbit HRMS] 📧 Notification Email sent to: ${options.to}`);
        return { messageId: `mock-${Date.now()}` };
      }
    };
  }
  return transporter;
};

const sendInviteEmail = async ({ to, name, inviteToken, tempPassword }) => {
  const mailer = await getTransporter();
  const inviteUrl = `${env.CLIENT_URL}/login`;
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@taskorbit.com';

  const mailOptions = {
    from: `"TaskOrbit HRMS" <${senderEmail}>`,
    to,
    subject: 'Welcome to TaskOrbit HRMS - Your Account Details',
    text: `Hello ${name},\n\nAn account has been created for you at TaskOrbit HRMS.\n\nLogin URL: ${inviteUrl}\nUsername: ${to}\nPassword: ${tempPassword || 'Set during invitation'}\n\nPlease log in and change your password.\n\nBest regards,\nHR Administration`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #f0f0f0; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #111317; font-size: 22px; font-weight: 800; margin: 0;">TaskOrbit HRMS</h2>
          <span style="font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1.5px;">Enterprise Portal</span>
        </div>
        
        <p style="font-size: 14px; color: #333; line-height: 1.6;">Hello <b>${name}</b>,</p>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">Welcome to the company! Your official HR portal account has been created. You can use this account for biometric attendance punch, leave requests, and payslip downloads.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;">Portal URL: <a href="${inviteUrl}" style="color: #000; font-weight: 600;">${inviteUrl}</a></p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;">Username: <b style="color: #0f172a;">${to}</b></p>
          ${tempPassword ? `<p style="margin: 4px 0; font-size: 13px; color: #64748b;">Initial Password: <b style="color: #0f172a;">${tempPassword}</b></p>` : ''}
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${inviteUrl}" style="display: inline-block; background-color: #111317; color: #C7F436; font-size: 13px; font-weight: 800; text-decoration: none; padding: 12px 28px; border-radius: 9999px;">Sign In to HRMS →</a>
        </div>
        
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 25px;">Please change your password immediately after your first sign-in in your Profile tab.</p>
      </div>
    `
  };

  try {
    return await mailer.sendMail(mailOptions);
  } catch (err) {
    console.error('⚠️ [Email Service] Dispatch error:', err.message);
    return null;
  }
};

module.exports = {
  getTransporter,
  sendInviteEmail
};
