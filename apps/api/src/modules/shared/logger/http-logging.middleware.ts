import { Injectable, NestMiddleware } from '@nestjs/common';
import type { RequestStore } from '@shared/context';
import type { NextFunction, Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { performance } from 'node:perf_hooks';
import { AppLogger } from './app-logger.service';

/**
 * O contexto é capturado na entrada porque o evento `finish` dispara fora dele; o
 * userId é lido no fim, depois que o AuthGuard o preencheu.
 */
@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService<RequestStore>,
    private readonly logger: AppLogger,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = performance.now();
    const requestId = this.cls.getId();
    const store = this.cls.get();

    res.on('finish', () => {
      this.logger.log('Requisição atendida', {
        context: 'HTTP',
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Math.round(performance.now() - startedAt),
        requestId,
        userId: store.userId,
      });
    });
    next();
  }
}
