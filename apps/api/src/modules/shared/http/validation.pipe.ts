import { ValidationError, ValidationPipe } from '@nestjs/common';
import { DomainExceptionDetails, InvalidInputDomainException } from '@shared/exception';

// Constraint do class-validator para campo fora do DTO (forbidNonWhitelisted).
const UNKNOWN_FIELD_CONSTRAINT = 'whitelistValidation';

const toDetails = (errors: ValidationError[], parent?: string): DomainExceptionDetails =>
  errors.reduce<DomainExceptionDetails>((details, error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    if (error.constraints) {
      details[path] = Object.entries(error.constraints).map(([constraint, message]) =>
        constraint === UNKNOWN_FIELD_CONSTRAINT ? 'campo não permitido' : message,
      );
    }
    return error.children?.length ? { ...details, ...toDetails(error.children, path) } : details;
  }, {});

export const createValidationPipe = (): ValidationPipe =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new InvalidInputDomainException(
        'VALIDATION_ERROR',
        'Há campos inválidos na requisição.',
        toDetails(errors),
      ),
  });
