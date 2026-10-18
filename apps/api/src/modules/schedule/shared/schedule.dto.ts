import { Transform } from 'class-transformer';
import { toSaoPauloIso } from './sao-paulo-time';

export const SaoPauloIso = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) =>
    value instanceof Date ? toSaoPauloIso(value) : value,
  );
