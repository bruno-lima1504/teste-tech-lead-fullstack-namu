import { applyDecorators, createParamDecorator, UseGuards } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import type { RequestStore } from '@shared/context';
import { ClsServiceManager } from 'nestjs-cls';
import { AuthGuard } from './auth.guard';
import { USER_ID_HEADER } from './parse-user-id';

export const Authenticated = (): MethodDecorator & ClassDecorator =>
  applyDecorators(
    UseGuards(AuthGuard),
    ApiHeader({
      name: USER_ID_HEADER,
      required: true,
      description: 'Id do usuário que faz a requisição (a autenticação está fora do escopo).',
      example: '1',
    }),
  );

export const CurrentUserId = createParamDecorator((): number => {
  const userId = ClsServiceManager.getClsService<RequestStore>().get('userId');
  if (userId === undefined) {
    throw new Error('@CurrentUserId() usado em uma rota sem @Authenticated().');
  }
  return userId;
});
