import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiPropertyOptional, ApiResponse } from '@nestjs/swagger';
import type { DomainExceptionDetails } from '@shared/exception';

export class ApiErrorResponseDto {
  /** @example 409 */
  statusCode: number;

  /**
   * Código estável para o cliente tratar o erro.
   * @example SLOT_UNAVAILABLE
   */
  code: string;

  /**
   * Mensagem para exibir ao usuário.
   * @example Este horário já foi agendado. Escolha outro horário.
   */
  message: string;

  @ApiPropertyOptional({
    description: 'Mensagens por campo, nos erros de validação.',
    type: 'object',
    additionalProperties: { type: 'array', items: { type: 'string' } },
    example: { slotId: ['deve ser o id de um horário (inteiro positivo)'] },
  })
  details?: DomainExceptionDetails;
}

export const ApiErrors = (codesByStatus: Partial<Record<HttpStatus, string[]>>): MethodDecorator =>
  applyDecorators(
    ...Object.entries(codesByStatus).map(([status, codes = []]) =>
      ApiResponse({
        status: Number(status),
        type: ApiErrorResponseDto,
        description: `code: ${codes.join(' | ')}`,
      }),
    ),
  );
