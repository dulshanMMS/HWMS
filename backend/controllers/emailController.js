import { sendEmail } from '../utils/sendEmail.js';

export const sendAdminPromotionEmail = async (req, res) => {
  const { email, subject, body } = req.body;

  if (!email || !subject || !body) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const htmlContent = `
      <h3>${subject}</h3>
      <p>${body}</p>
    `;

    await sendEmail({
      to: email,
      subject,
      text: body,
      html: htmlContent
    });

    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
};

