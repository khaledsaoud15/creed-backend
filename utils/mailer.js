const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "GMAIL",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  await transport.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
