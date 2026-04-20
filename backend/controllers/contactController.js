import ContactQuery from '../models/ContactQuery.js';
import emailQueue from '../utils/emailQueue.js';
import contactTemplate from '../emailTemplates/contactTemplate.js';
import adminResponseTemplate from '../emailTemplates/adminResponseTemplate.js';

export const submitQuery = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const newQuery = new ContactQuery({ name, email, subject, message });
    await newQuery.save();

    // Queue email to admin
    await emailQueue.add('contactUsQuery', {
      to: 'info.finoqz@gmail.com',
      subject: `New Contact Query: ${subject}`,
      html: contactTemplate({ name, email, subject, message })
    });

    res.status(201).json({ message: 'Query submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit query', error: error.message });
  }
};

export const getQueries = async (req, res) => {
  try {
    const queries = await ContactQuery.find().sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch queries', error: error.message });
  }
};

export const updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const query = await ContactQuery.findByIdAndUpdate(id, { status }, { new: true });
    if (!query) return res.status(404).json({ message: 'Query not found' });

    res.status(200).json(query);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update query status', error: error.message });
  }
};

export const respondToQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    const query = await ContactQuery.findById(id);
    if (!query) return res.status(404).json({ message: 'Query not found' });

    // Send email to user
    await emailQueue.add('adminContactReply', {
      to: query.email,
      subject: `Re: ${query.subject}`,
      html: adminResponseTemplate({
        name: query.name,
        originalMessage: query.message,
        replyMessage
      })
    });

    // Update status
    query.status = 'responded';
    await query.save();

    res.status(200).json({ message: 'Response sent successfully', query });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send response', error: error.message });
  }
};

export const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const query = await ContactQuery.findByIdAndDelete(id);
    if (!query) return res.status(404).json({ message: 'Query not found' });

    res.status(200).json({ message: 'Query deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete query', error: error.message });
  }
};
