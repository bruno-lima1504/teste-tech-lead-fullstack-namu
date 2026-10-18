import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@shared/config';
import { AppModule } from './app.module';
import type { AppConfig } from './config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const config = app.get<ConfigService<AppConfig>>(ConfigService);
  await app.listen(config.get('app.port'));
}

void bootstrap();
