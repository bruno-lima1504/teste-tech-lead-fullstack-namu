import { Injectable, LoggerService } from '@nestjs/common';
import type { RequestStore } from '@shared/context';
import { ClsServiceManager } from 'nestjs-cls';
import { createWinstonLogger } from './logger.factory';

type Level = 'error' | 'warn' | 'info' | 'debug' | 'verbose';
type Fields = Record<string, unknown>;

const winston = createWinstonLogger();

const serializeError = (error: Error): Fields => ({
  name: error.name,
  message: error.message,
  stack: error.stack,
});

/**
 * Cada entrada leva o requestId e o userId da requisição corrente. Aceita a assinatura
 * do Nest (`error(msg, stack, contexto)`) e campos estruturados (`error(msg, { error })`).
 */
@Injectable()
export class AppLogger implements LoggerService {
  log(message: unknown, ...params: unknown[]): void {
    this.write('info', message, params);
  }

  error(message: unknown, ...params: unknown[]): void {
    this.write('error', message, params);
  }

  warn(message: unknown, ...params: unknown[]): void {
    this.write('warn', message, params);
  }

  debug(message: unknown, ...params: unknown[]): void {
    this.write('debug', message, params);
  }

  verbose(message: unknown, ...params: unknown[]): void {
    this.write('verbose', message, params);
  }

  fatal(message: unknown, ...params: unknown[]): void {
    this.write('error', message, params);
  }

  private write(level: Level, message: unknown, params: unknown[]): void {
    const fields: Fields = {};
    for (const param of params) {
      if (typeof param === 'string') {
        fields[param.includes('\n    at ') ? 'stack' : 'context'] = param;
      } else if (param instanceof Error) {
        fields.error = serializeError(param);
      } else if (param && typeof param === 'object') {
        Object.assign(fields, param);
      }
    }
    if (fields.error instanceof Error) {
      fields.error = serializeError(fields.error);
    }
    if (message instanceof Error) {
      fields.error ??= serializeError(message);
    }

    winston.log({
      level,
      message: message instanceof Error ? message.message : String(message),
      ...this.requestFields(),
      ...fields,
    });
  }

  private requestFields(): Fields {
    const cls = ClsServiceManager.getClsService<RequestStore>();
    if (!cls.isActive()) {
      return {};
    }
    return { requestId: cls.getId(), userId: cls.get('userId') };
  }
}
