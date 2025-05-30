import SupportRequest from '../models/SupportRequest.js';

export const submitSupportRequest = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const userId = req.user ? req.user.id : null; // from auth middleware if available

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newRequest = new SupportRequest({
      name,
      email,
      subject,
      message,
      userId,
    });

    await newRequest.save();

    res.status(201).json({ message: 'Support request submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit support request', error: error.message });
  }
};
