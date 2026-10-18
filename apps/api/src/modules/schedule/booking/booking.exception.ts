import { ConflictDomainException } from '@shared/exception';

export class SlotUnavailableException extends ConflictDomainException {
  constructor() {
    super('SLOT_UNAVAILABLE', 'Este horário já foi agendado. Escolha outro horário.');
  }
}

export class BookingOverlapException extends ConflictDomainException {
  constructor() {
    super('BOOKING_OVERLAP', 'Você já tem uma sessão confirmada que coincide com este horário.');
  }
}
