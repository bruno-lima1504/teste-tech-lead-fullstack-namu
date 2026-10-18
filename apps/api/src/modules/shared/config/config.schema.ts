import { z } from 'zod';
import { ConfigException } from './config.exception';

export const parseConfig = <S extends z.ZodType>(schema: S, raw: unknown): z.output<S> => {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ConfigException(`Configuração inválida:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
};
