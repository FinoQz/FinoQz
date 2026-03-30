const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const redis = require('../utils/redis');

function sha256Hex(input) {
  return crypto.createHash('sha256').update(String(input || '')).digest('hex');
}

async function generateToken(user, req, res) {
  try {
    const fingerprint = sha256Hex(req.ip + '|' + req.get('user-agent'));

    const now = Math.floor(Date.now() / 1000); // current UNIX timestamp in seconds
    const expiresInSeconds = 86400; // 1 day

    const payload = {
      id: user._id,
      role: user.role || 'user',
      fingerprint,
      iat: now,
    };

    // ✅ Generate JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expiresInSeconds,
    });

    // ✅ Decode to confirm
    const decoded = jwt.decode(token);
    console.log('🧪 Token issued at:', new Date(decoded.iat * 1000).toLocaleString());
    console.log('🧪 Token expires at:', new Date(decoded.exp * 1000).toLocaleString());
    console.log('🕒 Server time now:', new Date().toLocaleString());

    // ✅ Store token in Redis
    await redis.set(`session:${user._id}`, token, 'EX', expiresInSeconds);

    // ✅ Set token in HTTP-only cookie
    res.cookie('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: expiresInSeconds * 1000, // in milliseconds
    });

    return { token, expiresIn: expiresInSeconds };
  } catch (err) {
    console.error('❌ Error generating token:', err);
    throw new Error('Token generation failed');
  }
}

module.exports = generateToken;
