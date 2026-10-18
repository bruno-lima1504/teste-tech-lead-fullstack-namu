import { Module } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ClsModule } from 'nestjs-cls';
import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'X-Request-Id';

// O id recebido de quem chama só é aceito num formato seguro para ir ao log.
const REQUEST_ID_FORMAT = /^[\w-]{1,64}$/;

const requestIdOf = (req: Request): string => {
  const received = req.header(REQUEST_ID_HEADER);
  return received && REQUEST_ID_FORMAT.test(received) ? received : randomUUID();
};

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: requestIdOf,
        setup: (cls, _req: Request, res: Response) => {
          res.setHeader(REQUEST_ID_HEADER, cls.getId());
        },
      },
    }),
  ],
})
export class RequestContextModule {}
