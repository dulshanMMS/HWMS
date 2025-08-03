import multer from 'multer';
import { sendEmail } from '../utils/sendEmail.js';

const upload = multer({ storage: multer.memoryStorage() });

export const sendAdminPromotionEmail = [
  upload.array('files'), 
  async (req, res) => {
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
        html: htmlContent,
        attachments: req.files?.map((file) => ({
          filename: file.originalname,
          content: file.buffer,
        })) || [],
      });

      res.status(200).json({ message: 'Email sent successfully.' });
    } catch (err) {
      console.error('Error sending email:', err);
      res.status(500).json({ error: 'Failed to send email.' });
    }
  },
];
