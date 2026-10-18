import { parseConfig } from '@shared/config';
import { z } from 'zod';

const scheduleConfigSchema = z.object({
  schedule: z.object({
    database: z.object({
      host: z.string().min(1),
      port: z.coerce.number().int().positive(),
      username: z.string().min(1),
      password: z.string(),
      name: z.string().min(1),
    }),
  }),
});

export type ScheduleConfig = z.output<typeof scheduleConfigSchema>;

export const scheduleConfigFactory = (): ScheduleConfig =>
  parseConfig(scheduleConfigSchema, {
    schedule: {
      database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
      },
    },
  });
