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



// GET /api/support/grouped   -----------------------------------Maleesha
export const getGroupedSupportRequests = async (req, res) => {
  try {
    const all = await SupportRequest.find().sort({ createdAt: -1 });

    const grouped = {};

    all.forEach((req) => {
      const key = req.email; // use email as unique sender ID
      if (!grouped[key]) {
        grouped[key] = {
          sender: {
            name: req.name,
            email: req.email
          },
          requests: []
        };
      }
      grouped[key].requests.push(req);
    });

    res.json({ success: true, groupedRequests: Object.values(grouped) });
  } catch (err) {
    console.error("Error fetching grouped support requests:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Update the read/unread status ----------------------------Maleesha
export const markSupportRequestsAsRead = async (req, res) => {
  const { requestIds } = req.body;

  if (!Array.isArray(requestIds)) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  try {
    await SupportRequest.updateMany(
      { _id: { $in: requestIds } },
      { $set: { status: "replied" } }
    );

    res.json({ success: true, message: "Marked as read/replied" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

