import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import {
  BusinessRuleDomainException,
  ConflictDomainException,
  DomainException,
  InvalidInputDomainException,
  NotFoundDomainException,
  UnauthenticatedDomainException,
} from '@shared/exception';
import { AppLogger } from '@shared/logger';
import type { Request, Response } from 'express';
import { ApiErrorResponseDto } from './api-error-response.dto';

const STATUS_BY_CATEGORY: [abstract new (...args: never[]) => DomainException, HttpStatus][] = [
  [InvalidInputDomainException, HttpStatus.BAD_REQUEST],
  [UnauthenticatedDomainException, HttpStatus.UNAUTHORIZED],
  [NotFoundDomainException, HttpStatus.NOT_FOUND],
  [ConflictDomainException, HttpStatus.CONFLICT],
  [BusinessRuleDomainException, HttpStatus.UNPROCESSABLE_ENTITY],
];

const SERVER_ERROR: number = HttpStatus.INTERNAL_SERVER_ERROR;

// Erros do próprio Nest/Express, antes de chegar a um controller.
const HTTP_MESSAGES: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Requisição inválida.',
  [HttpStatus.NOT_FOUND]: 'Rota não encontrada.',
  [HttpStatus.METHOD_NOT_ALLOWED]: 'Método não permitido.',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'Corpo da requisição grande demais.',
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Tipo de conteúdo não suportado.',
};

// JSON malformado chega como BadRequestException; corpo grande demais, como erro com `status`.
const httpStatusOf = (exception: unknown): number | undefined => {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }
  if (exception instanceof Error && 'status' in exception && typeof exception.status === 'number') {
    return exception.status;
  }
  return undefined;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const body = this.toResponse(exception);

    if (body.statusCode >= SERVER_ERROR) {
      this.logger.error('Erro inesperado', {
        context: ApiExceptionFilter.name,
        error: exception,
        method: request.method,
        path: request.originalUrl,
      });
    }
    http.getResponse<Response>().status(body.statusCode).json(body);
  }

  private toResponse(exception: unknown): ApiErrorResponseDto {
    if (exception instanceof DomainException) {
      return {
        statusCode:
          STATUS_BY_CATEGORY.find(([category]) => exception instanceof category)?.[1] ??
          HttpStatus.UNPROCESSABLE_ENTITY,
        code: exception.code,
        message: exception.message,
        ...(exception.details && { details: exception.details }),
      };
    }

    const status = httpStatusOf(exception);
    if (status !== undefined && status < SERVER_ERROR) {
      return {
        statusCode: status,
        code: HttpStatus[status] ?? 'HTTP_ERROR',
        message: HTTP_MESSAGES[status] ?? 'Requisição não atendida.',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Erro interno. Tente novamente em instantes.',
    };
  }
}
