import winston from 'winston';

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), 
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    // Archivo de errores para niveles "error"
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // Archivo combinado para todos los logs
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

export default logger;
