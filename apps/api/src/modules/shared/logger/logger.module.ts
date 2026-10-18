import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestContextModule } from '@shared/context';
import { AppLogger } from './app-logger.service';
import { HttpLoggingMiddleware } from './http-logging.middleware';

@Global()
@Module({
  imports: [RequestContextModule],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggingMiddleware).forRoutes('*');
  }
}
