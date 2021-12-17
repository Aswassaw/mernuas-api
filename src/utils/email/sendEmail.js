const transporter = require("../../config/email");

const sendEmail = (dataEmail) => {
  return transporter
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
