const ActivityLog = require('../models/ActivityLog');
const getDeviceInfo = require('./getDeviceInfo');

module.exports = async function logActivity({
  req,
  actorType,
  actorId,
  action,
  meta = {}
}) {
  try {
    const ip =
      req?.headers?.['x-forwarded-for'] ||
      req?.socket?.remoteAddress ||
      'unknown';

    const device = getDeviceInfo(req);

    await ActivityLog.create({
      actorType,
      actorId,
      action,
      ip,
      device,
      userAgent: req?.headers?.['user-agent'] || 'unknown',
      meta
    });

    console.log(`✅ Logged ${actorType} ${action}`);
  } catch (err) {
    console.error('❌ Failed to log activity:', err);
  }
};
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
