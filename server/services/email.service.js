const { createTransporter } = require('../config/email');

class EmailService {
  async sendPasswordResetEmail(email, resetLink) {
    const senderEmail = process.env.EMAIL_USER || 'fashiali412@gmail.com';
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ShopSense AI" <${senderEmail}>`,
      to: email,
      subject: 'ShopSense AI — Password Reset Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #0f172a; margin-top: 0;">Reset Your ShopSense AI Password</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            We received a request to reset the password for <strong>${email}</strong>. Click the button below to choose a new password (expires in 15 minutes):
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
}

module.exports = new EmailService();
