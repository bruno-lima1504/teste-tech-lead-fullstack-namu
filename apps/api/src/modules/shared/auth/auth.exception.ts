import { InvalidInputDomainException, UnauthenticatedDomainException } from '@shared/exception';

export class MissingUserIdException extends UnauthenticatedDomainException {
  constructor() {
    super('MISSING_USER_ID', 'Informe o usuário no header X-User-Id.');
  }
}

export class InvalidUserIdException extends InvalidInputDomainException {
  constructor() {
    super('INVALID_USER_ID', 'O header X-User-Id deve ser um id de usuário (inteiro positivo).');
  }
}
