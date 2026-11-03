const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = process.env.EMAIL_USER || 'fashiali412@gmail.com';
  const defaultPass = Buffer.from('ampyZmNqeGZ2ZGhxcXRtZw==', 'base64').toString('utf8');
  const pass = (process.env.EMAIL_PASS || defaultPass).replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

module.exports = { createTransporter };
