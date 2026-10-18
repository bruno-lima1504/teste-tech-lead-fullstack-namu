import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService, Path, PathValue } from '@nestjs/config';

/**
 * `get('schedule.database.host')` só aceita caminhos do schema e devolve o tipo do campo;
 * as factories já validaram tudo com zod, então nunca é `undefined`.
 */
@Injectable()
export class ConfigService<C = Record<string, unknown>> extends NestConfigService<C, true> {
  override get<P extends Path<C>>(propertyPath: P): PathValue<C, P> {
    return super.get(propertyPath, { infer: true });
  }
}
