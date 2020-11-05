const nodemailer = require('nodemailer');
const config = require('../config/mailer');

const mailgun = require("mailgun-js");
const DOMAIN = 'https://api.mailgun.net/v3/sandbox0ec57c53694543b7b558577233b2f2b2.mailgun.org';
const mg = mailgun({apiKey: '2f23efbddb406b8424ac117447096ced-9b1bf5d3-0c42fe8a', domain: DOMAIN});


module.exports = {
  sendEmail(from,to,subject,html){
    return new Promise((resolve,reject) => {
      mg.messages().send({from, subject, to ,html}, (err,info) => {

        console.log("body_info::::::",info);
        if(err) reject(err);

        resolve(info);
      });
    });
  }
}
