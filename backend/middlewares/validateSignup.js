// middlewares/validateSignup.js
module.exports = (req, res, next) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ message: 'Full name and email are required' });
  }
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  next();
};
