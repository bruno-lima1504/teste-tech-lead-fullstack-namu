import type { DomainExceptionDetails } from '@shared/exception';

export class ApiErrorResponseDto {
  statusCode: number;
  code: string;
  message: string;
  details?: DomainExceptionDetails;
}
