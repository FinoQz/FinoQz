// // utils/getDeviceInfo.js
// const geoip = require('geoip-lite');

// module.exports = function getDeviceInfo(req) {
//   // ✅ Extract IP from all possible proxy headers
//   let ip =
//     req.headers['x-client-ip'] ||
//     req.headers['x-real-ip'] ||
//     req.headers['cf-connecting-ip'] || // Cloudflare
//     req.headers['x-forwarded-for']?.split(',')[0] ||
//     req.connection?.remoteAddress ||
//     req.socket?.remoteAddress ||
//     req.ip ||
//     '';

//   // ✅ Normalize IPv6 mapped IPv4 (e.g., ::ffff:103.12.45.22)
//   ip = ip.replace(/^::ffff:/, '').trim();

//   // ✅ Remove IPv6 localhost (::1)
//   if (ip === '::1') ip = '127.0.0.1';

//   // ✅ Remove private/local IPs (not useful for geo lookup)
//   const privateRanges = ['127.', '10.', '192.168.', '172.16.', '172.20.', '172.31.'];
//   if (privateRanges.some((p) => ip.startsWith(p))) {
//     ip = '0.0.0.0'; // fallback for local/dev
//   }

//   // ✅ Geo lookup
//   const geo = geoip.lookup(ip);

//   return {
//     ip,
//     device: req.headers['user-agent'] || 'Unknown device',
//     time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),

//     location: geo
//       ? `${geo.city || 'Unknown'}, ${geo.region || ''}, ${geo.country}`
//       : 'Location not found',

//     rawGeo: geo || null,
//   };
// };
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

module.exports = function getDeviceInfo(req) {
  let ip =
    req.headers['x-client-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '';

  ip = ip.replace(/^::ffff:/, '').trim();
  if (ip === '::1') ip = '127.0.0.1';

  const privateRanges = ['127.', '10.', '192.168.', '172.16.', '172.20.', '172.31.'];
  if (privateRanges.some((p) => ip.startsWith(p))) {
    ip = '0.0.0.0';
  }

  const geo = ip !== '0.0.0.0' ? geoip.lookup(ip) : null;
  const ua = new UAParser(req.headers['user-agent']);
  const parsedUA = ua.getResult();

  return {
    ip,
    device: {
      browser: parsedUA.browser.name || 'Unknown',
      os: parsedUA.os.name || 'Unknown',
      platform: parsedUA.device.type || 'desktop',
    },
    time: {
      iso: new Date().toISOString(),
      local: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    },
    location: geo ? {
      city: geo.city || 'Unknown',
      region: geo.region || 'Unknown',
      country: geo.country || 'Unknown',
      lat: geo.ll ? geo.ll[0] : null,
      lon: geo.ll ? geo.ll[1] : null,
    } : null,
    rawGeo: geo || null,
  };
};
