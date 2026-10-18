import { parseConfig } from '@shared/config';
import { z } from 'zod';

const appConfigSchema = z.object({
  app: z.object({
    port: z.coerce.number().int().positive(),
  }),
});

export type AppConfig = z.output<typeof appConfigSchema>;

export const appConfigFactory = (): AppConfig =>
  parseConfig(appConfigSchema, {
    app: { port: process.env.PORT },
  });
