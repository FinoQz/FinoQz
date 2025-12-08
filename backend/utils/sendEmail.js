const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 1,
  maxMessages: 20,
  rateDelta: 2000,
  rateLimit: 1,
});

module.exports = async ({ to, subject, html }) => {
  console.log("📨 Sending email to:", to);

  // ✅ SAFETY CHECK 1 — prevent crash if "to" missing
  if (!to) {
    console.error("❌ sendEmail called WITHOUT 'to' address. Subject:", subject);
    return;
  }

  // ✅ SAFETY CHECK 2 — prevent crash if "html" missing
  if (!html) {
    console.error("❌ sendEmail called WITHOUT 'html' body. To:", to);
    return;
  }

  const mailOptions = {
    from: `"FinoQz" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text: html.replace(/<[^>]+>/g, ""), // ✅ safe now because html is guaranteed
  };

  let attempt = 0;
  const maxRetries = 2;

  while (attempt <= maxRetries) {
    try {
      await new Promise(r => setTimeout(r, 300)); // ✅ avoid OTP throttling
      await transporter.sendMail(mailOptions);

      logger?.info?.(`✅ Email sent to ${to} [${subject}]`);
      return;
    } catch (err) {
      attempt++;
      console.log("SMTP ERROR DETAILS:", err?.response || err?.message);

      logger?.error?.(
        `❌ Email send failed to ${to} [${subject}] — Attempt ${attempt}`,
        err
      );

      if (attempt > maxRetries) throw err;

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
};
// const nodemailer = require('nodemailer');
// const logger = require('./logger');

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   secure: Number(process.env.SMTP_PORT) === 465,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   pool: true,
//   maxConnections: 1,
//   maxMessages: 20,
//   rateDelta: 2000,
//   rateLimit: 1,
// });

// // ✅ Verify transporter at startup
// transporter.verify((err, success) => {
//   if (err) {
//     console.error("❌ SMTP connection failed:", err.message);
//   } else {
//     console.log("✅ SMTP server ready to send emails");
//   }
// });

// module.exports = async ({ to, subject, html, attachments = [], from }) => {
//   console.log("📨 Sending email to:", to);

//   if (!to) {
//     console.error("❌ sendEmail called WITHOUT 'to' address. Subject:", subject);
//     return;
//   }
//   if (!html) {
//     console.error("❌ sendEmail called WITHOUT 'html' body. To:", to);
//     return;
//   }

//   const mailOptions = {
//     from: from || process.env.SMTP_FROM || `"FinoQz" <${process.env.SMTP_USER}>`,
//     to,
//     subject,
//     html,
//     text: html.replace(/<[^>]+>/g, ""),
//     attachments, // ✅ support attachments
//   };

//   let attempt = 0;
//   const maxRetries = 2;

//   while (attempt <= maxRetries) {
//     try {
//       await new Promise(r => setTimeout(r, 300 * (attempt + 1))); // ✅ exponential backoff
//       await transporter.sendMail(mailOptions);

//       logger?.info?.(`✅ Email sent to ${to} [${subject}]`);
//       return;
//     } catch (err) {
//       attempt++;
//       console.error("❌ SMTP ERROR:", {
//         code: err.code,
//         message: err.message,
//         response: err.response,
//       });

//       logger?.error?.(
//         `❌ Email send failed to ${to} [${subject}] — Attempt ${attempt}`,
//         err
//       );

//       if (attempt > maxRetries) throw err;
//       await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
//     }
//   }
// };
