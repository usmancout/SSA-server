const nodemailer = require('nodemailer');
const { createTransporter } = require('../config/email');

class EmailService {
  async sendPasswordResetEmail(email, resetLink) {
    // 1. If Gmail credentials are configured in .env, send real email via Gmail SMTP
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = createTransporter();
      const mailOptions = {
        from: `"ShopSense AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'ShopSense AI — Password Reset Link',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #0f172a; margin-top: 0;">Reset Your ShopSense AI Password</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              We received a request to reset the password for <strong>${email}</strong>. Click the button below to choose a new password (valid for 15 minutes):
            </p>
            <p style="margin: 24px 0;">
              <a href="${resetLink}" style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p style="color: #64748b; font-size: 12px;">
              Or copy and paste this link into your browser:<br/>
              <a href="${resetLink}" style="color: #059669;">${resetLink}</a>
            </p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
      return { sentViaSmtp: true, previewUrl: null };
    }

    // 2. Fallback when EMAIL_USER / EMAIL_PASS are not configured: use Nodemailer Ethereal test account
    try {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const info = await testTransporter.sendMail({
        from: '"ShopSense AI" <no-reply@shopsense.ai>',
        to: email,
        subject: 'ShopSense AI — Password Reset Link',
        html: `<p>Click the link below to reset your password (expires in 15 minutes):</p><p><a href="${resetLink}">${resetLink}</a></p>`
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      console.log('Password Reset Link:', resetLink);
      if (previewUrl) {
        console.log('Ethereal Email Preview URL:', previewUrl);
      }
      return { sentViaSmtp: false, previewUrl };
    } catch (err) {
      console.log('Password Reset Link (local fallback):', resetLink);
      return { sentViaSmtp: false, previewUrl: null };
    }
  }
}

module.exports = new EmailService();
