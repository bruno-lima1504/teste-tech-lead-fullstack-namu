import { utilities as nestWinston } from 'nest-winston';
import { createLogger, format, Logger, transports } from 'winston';

export const createWinstonLogger = (env = process.env.NODE_ENV): Logger =>
  createLogger({
    level: 'info',
    silent: env === 'test',
    format:
      env === 'production'
        ? format.combine(format.timestamp(), format.json())
        : format.combine(
            format.timestamp(),
            format.ms(),
            nestWinston.format.nestLike('api', { colors: true, prettyPrint: true }),
          ),
    transports: [new transports.Console()],
  });
