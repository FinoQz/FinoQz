
const nodemailer = require('nodemailer');
const logger = require('./logger'); // optional: custom logger

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // set true if using port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email with retry and logging
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
module.exports = async (to, subject, html) => {
  const mailOptions = {
    from: `"FinoQz" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  let attempt = 0;
  const maxRetries = 2;

  while (attempt <= maxRetries) {
    try {
      await transporter.sendMail(mailOptions);
      logger?.info?.(`Email sent to ${to} [${subject}]`);
      return;
    } catch (err) {
      attempt++;
      logger?.error?.(`Email send failed to ${to} [${subject}] — Attempt ${attempt}`, err);
      if (attempt > maxRetries) throw err;
    }
  }
};
