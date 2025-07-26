import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  // Debug version: logs success or failure
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Email failed:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
