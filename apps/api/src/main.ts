import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@shared/config';
import { configureHttpApp } from '@shared/http';
import { AppLogger } from '@shared/logger';
import { AppModule } from './app.module';
import type { AppConfig } from './config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(AppLogger));
  configureHttpApp(app);
  app.enableShutdownHooks();

  const config = app.get<ConfigService<AppConfig>>(ConfigService);
  await app.listen(config.get('app.port'));
}

void bootstrap();
