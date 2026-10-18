import { UnauthenticatedDomainException } from '@shared/exception';

export class UnknownUserException extends UnauthenticatedDomainException {
  constructor() {
    super('UNKNOWN_USER', 'Usuário não encontrado.');
  }
}
