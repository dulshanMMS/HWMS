import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
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
    attachments, // ✅ INCLUDE THIS
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Email failed:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
