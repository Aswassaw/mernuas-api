require("dotenv").config();
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

// oayh2 config
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const sendEmail = async (dataEmail) => {
  // config nodemailer
  const accessToken = await oAuth2Client.getAccessToken();
  const transporter = nodemailer.createTransport(
    {
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      }
    }
  );

  // send email
  transporter
    .sendMail(dataEmail)
    .then((info) => {
      console.log("Email sended successfully.");
      console.log(info);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};

module.exports = sendEmail;
