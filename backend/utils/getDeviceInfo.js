const geoip = require('geoip-lite');

module.exports = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || '';
  ip = ip.split(',')[0].trim().replace(/^::ffff:/, ''); // handle IPv6-mapped IPv4

  const geo = geoip.lookup(ip);

  return {
    ip,
    device: req.headers['user-agent'] || 'Unknown device',
    time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    location: geo
      ? `${geo.city || 'Unknown'}, ${geo.region || ''}, ${geo.country}`
      : 'Location not found',
    rawGeo: geo || null,
  };
};
