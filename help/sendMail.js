const nodemailer = require("nodemailer");

const { META_EMAIL, META_PASS } = process.env;

const nodConfig = {
    host: "smtp.meta.ua",
    port: 465,
    secure: true,
    auth: { user: META_EMAIL, pass: META_PASS },
}

const transport = nodemailer.createTransport(nodConfig);

const sendMail = async(data) => {
    const mail = {
        ...data,
        from: META_EMAIL,
    }

    transport
    .sendMail(mail)
    .then(() => console.log("Mail sent successfully"))
    .catch((err) => console.log(err.message));
}

module.exports = sendMail