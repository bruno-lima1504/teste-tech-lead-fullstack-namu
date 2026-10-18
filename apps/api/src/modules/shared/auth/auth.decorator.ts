import { applyDecorators, createParamDecorator, UseGuards } from '@nestjs/common';
import type { RequestStore } from '@shared/context';
import { ClsServiceManager } from 'nestjs-cls';
import { AuthGuard } from './auth.guard';

export const Authenticated = (): MethodDecorator & ClassDecorator =>
  applyDecorators(UseGuards(AuthGuard));

export const CurrentUserId = createParamDecorator((): number => {
  const userId = ClsServiceManager.getClsService<RequestStore>().get('userId');
  if (userId === undefined) {
    throw new Error('@CurrentUserId() usado em uma rota sem @Authenticated().');
  }
  return userId;
});
