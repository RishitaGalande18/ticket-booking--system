const nodemailer = require("nodemailer");

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const mailFrom = process.env.MAIL_FROM || "no-reply@ticketbooking.com";

if (!smtpHost || !smtpUser || !smtpPass) {
  console.warn(
    "SMTP environment variables are not fully configured. Email sending may fail."
  );
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

const sendMail = async ({ to, subject, text, html, attachments }) => {
  const mailOptions = {
    from: mailFrom,
    to,
    subject,
    text,
    html,
    attachments
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendMail
};
