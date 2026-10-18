import type { INestApplication, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { configureHttpApp } from '@shared/http';

export const createNestApp = async (
  imports: NonNullable<ModuleMetadata['imports']>,
): Promise<{ module: TestingModule; app: INestApplication }> => {
  const module = await Test.createTestingModule({ imports }).compile();
  const app = configureHttpApp(module.createNestApplication());
  await app.init();
  return { module, app };
};
