require("dotenv").config();
const nodemailer = require("nodemailer");
const smtpPool = require("nodemailer-smtp-pool");

const transporter = nodemailer.createTransport(
  smtpPool({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
);

module.exports = transporter;
