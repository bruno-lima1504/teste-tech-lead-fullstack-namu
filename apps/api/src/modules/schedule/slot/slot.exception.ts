import { BusinessRuleDomainException, NotFoundDomainException } from '@shared/exception';

export class SlotNotFoundException extends NotFoundDomainException {
  constructor() {
    super('SLOT_NOT_FOUND', 'Horário não encontrado.');
  }
}

export class SlotInPastException extends BusinessRuleDomainException {
  constructor() {
    super('SLOT_IN_PAST', 'Este horário já começou ou já passou. Escolha um horário futuro.');
  }
}
