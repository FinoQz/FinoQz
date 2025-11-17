module.exports = (req, res, next) => {
  const { otp } = req.body;
  if (!otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'Invalid OTP format' });
  }
  next();
};
