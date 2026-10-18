import {
  BusinessRuleDomainException,
  ConflictDomainException,
  NotFoundDomainException,
} from '@shared/exception';
import { CANCELLATION_NOTICE_HOURS } from './booking.types';

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

export class BookingNotFoundException extends NotFoundDomainException {
  constructor() {
    super('BOOKING_NOT_FOUND', 'Sessão não encontrada.');
  }
}

export class BookingAlreadyCancelledException extends ConflictDomainException {
  constructor() {
    super('BOOKING_ALREADY_CANCELLED', 'Esta sessão já foi cancelada.');
  }
}

export class CancellationWindowClosedException extends BusinessRuleDomainException {
  constructor() {
    super(
      'CANCELLATION_WINDOW_CLOSED',
      `O cancelamento só é possível até ${CANCELLATION_NOTICE_HOURS} horas antes do início da sessão.`,
    );
  }
}
