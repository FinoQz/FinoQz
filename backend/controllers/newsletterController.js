import Newsletter from '../models/Newsletter.js';
import emailQueue from '../utils/emailQueue.js';
import newsletterWelcomeTemplate from '../emailTemplates/newsletterWelcomeTemplate.js';

export const subscribe = async (req, res) => {
  try {
    const { name, email } = req.body;

    let subscriber = await Newsletter.findOne({ email });

    if (subscriber) {
      if (subscriber.active) {
        return res.status(400).json({ message: 'Email already subscribed' });
      }
      subscriber.active = true;
      subscriber.name = name || subscriber.name;
    } else {
      subscriber = new Newsletter({ name, email });
    }

    await subscriber.save();

    // Queue welcome email
    await emailQueue.add('newsletterWelcome', {
      to: email,
      subject: 'Welcome to FinoQz Newsletter!',
      html: newsletterWelcomeTemplate({ name: name || 'Subscriber', token: subscriber.unsubscribeToken })
    });

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Subscription failed', error: error.message });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { token } = req.query;

    const subscriber = await Newsletter.findOneAndUpdate(
      { unsubscribeToken: token },
      { active: false },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({ message: 'Invalid unsubscription token' });
    }

    // Instead of just JSON, we could redirect to a success page
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>Unsubscribed Successfully</h1>
        <p>You have been removed from our mailing list. We're sorry to see you go!</p>
        <a href="https://finoqz.com" style="color: #253A7B; text-decoration: none; font-weight: bold;">Return to FinoQz</a>
      </div>
    `);
  } catch (error) {
    res.status(500).json({ message: 'Unsubscription failed', error: error.message });
  }
};

export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscribers', error: error.message });
  }
};

export const exportSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ active: true }).select('name email createdAt');
    
    let csv = 'Name,Email,Joined At\n';
    subscribers.forEach(s => {
      csv += `"${s.name || ''}","${s.email}","${s.createdAt.toISOString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
};
