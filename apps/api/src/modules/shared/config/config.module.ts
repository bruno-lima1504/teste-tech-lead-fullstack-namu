import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModuleOptions, ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';

type Options = Pick<ConfigModuleOptions, 'envFilePath' | 'load'>;

@Global()
@Module({})
export class ConfigModule {
  static forRoot(options: Options): DynamicModule {
    return {
      module: ConfigModule,
      imports: [NestConfigModule.forRoot(options)],
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}
