// module.exports = {
//   info: (...args) => console.log('[INFO]', ...args),
//   warn: (...args) => console.warn('[WARN]', ...args),
//   error: (...args) => console.error('[ERROR]', ...args),
// };
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json() // ✅ structured JSON logs
  ),
  transports: [
    new transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? format.combine(format.colorize(), format.simple())
        : format.json()
    }),
    // ✅ optional: file transport
    // new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;
