const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, text, html }) {
  const admin = process.env.ADMIN_EMAIL || "jesusmerci.jemer@gmail.com";
  // If SMTP_TEST is enabled, don't send real emails — just log and return a mock result
  if (process.env.SMTP_TEST === "true") {
    console.log("SMTP_TEST=true — email suppressed. Payload:", {
      from: process.env.SMTP_USER,
      to: to || admin,
      subject,
      text,
      html: (html || "").slice(0, 300),
    });
    return { mocked: true };
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: to || admin,
    subject,
    text,
    html,
  });
  return info;
}

module.exports = { sendMail };
