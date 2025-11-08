const { createTransporter } = require('../config/email');

class EmailService {
  async sendPasswordResetEmail(email, resetLink) {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password (expires in 15 minutes):</p>
        <a href="${resetLink}">${resetLink}</a>
      `
    };

    await transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
