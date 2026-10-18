export enum BookingStatus {
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
}

/** Antecedência mínima, em horas, para cancelar uma sessão. */
export const CANCELLATION_NOTICE_HOURS = 24;
