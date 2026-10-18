import type { INestApplication } from '@nestjs/common';
import { AppLogger } from '@shared/logger';
import { ApiExceptionFilter } from './api-exception.filter';
import { createValidationPipe } from './validation.pipe';

/** A mesma no main e nos testes e2e. */
export const configureHttpApp = <T extends INestApplication>(app: T): T => {
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new ApiExceptionFilter(new AppLogger()));
  return app;
};
