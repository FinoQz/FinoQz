import ActivityLog from '../models/ActivityLog.js';
import getDeviceInfo from './getDeviceInfo.js';
import geoip from 'geoip-lite';

const logActivity = async function ({
  req,
  actorType,
  actorId,
  action,
  meta = {}
}) {
  try {
    const ipHeader = req?.headers?.['x-forwarded-for'];
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : req?.socket?.remoteAddress || 'unknown';

    const device = getDeviceInfo(req);

    // ✅ Resolve Location
    let location = 'Unknown';
    if (ip && ip !== 'unknown' && ip !== '::1' && ip !== '127.0.0.1') {
      const geo = geoip.lookup(ip);
      if (geo) {
        location = `${geo.city || 'Unknown City'}, ${geo.country || 'Unknown Country'}`;
      }
    } else if (ip === '::1' || ip === '127.0.0.1') {
      location = 'Localhost';
    }

    await ActivityLog.create({
      actorType,
      actorId,
      action,
      ip,
      location,
      device,
      userAgent: req?.headers?.['user-agent'] || 'unknown',
      meta
    });

    console.log(`✅ Logged ${actorType} ${action}`);
  } catch (err) {
    console.error('❌ Failed to log activity:', err);
  }
};

export default logActivity;
// const ActivityLog = require('../models/ActivityLog');
// const getDeviceInfo = require('./getDeviceInfo');
// const logger = require('./logger'); // ✅ structured logger

// module.exports = async function logActivity({
//   req,
//   actorType,
//   actorId,
//   action,
//   meta = {},
//   status = 'success' // ✅ default status
// }) {
//   try {
//     const ipHeader = req?.headers?.['x-forwarded-for'];
//     const ip = ipHeader ? ipHeader.split(',')[0].trim() : req?.socket?.remoteAddress || 'unknown';

//     const device = getDeviceInfo(req);

//     await ActivityLog.create({
//       actorType,
//       actorId,
//       action,
//       status,
//       ip,
//       device,
//       userAgent: req?.headers?.['user-agent'] || 'unknown',
//       meta
//     });

//     logger.info(`Activity logged`, { actorType, actorId, action, status, ip, device });
//   } catch (err) {
//     logger.error('Failed to log activity', { actorType, actorId, action, error: err.message });
//   }
// };
