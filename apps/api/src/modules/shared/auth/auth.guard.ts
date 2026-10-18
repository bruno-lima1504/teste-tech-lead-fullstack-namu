import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { RequestStore } from '@shared/context';
import type { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { parseUserId, USER_ID_HEADER } from './parse-user-id';

/**
 * Ponto de troca da autenticação (fora do escopo): só identifica o usuário pelo header.
 * Se ele existe, quem verifica é o módulo dono da tabela users.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly cls: ClsService<RequestStore>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    this.cls.set('userId', parseUserId(request.header(USER_ID_HEADER)));
    return true;
  }
}
