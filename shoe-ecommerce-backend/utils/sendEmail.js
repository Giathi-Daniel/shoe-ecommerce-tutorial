const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async ({ email, subject, message }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.info(`Email not configured; message for ${email} (${subject}):\n${message}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: 'Shoe Store <no-reply@shoestore.com>',
    to: email,
    subject,
    text: message,
  });
};

module.exports = sendEmail;
