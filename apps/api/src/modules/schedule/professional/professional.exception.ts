import { BusinessRuleDomainException, NotFoundDomainException } from '@shared/exception';

export class ProfessionalNotFoundException extends NotFoundDomainException {
  constructor() {
    super('PROFESSIONAL_NOT_FOUND', 'Profissional não encontrado.');
  }
}

export class ProfessionalInactiveException extends BusinessRuleDomainException {
  constructor() {
    super('PROFESSIONAL_INACTIVE', 'Este profissional não está atendendo no momento.');
  }
}
