import { ApiError } from '@/modules/shared/api-client';

// O texto vem da API (já pensado para o usuário); aqui só o título do alerta, por código.
const TITLES: Record<string, string> = {
  SLOT_UNAVAILABLE: 'Horário ocupado',
  BOOKING_OVERLAP: 'Conflito de horário',
  SLOT_IN_PAST: 'Horário indisponível',
  SLOT_NOT_FOUND: 'Horário indisponível',
  PROFESSIONAL_INACTIVE: 'Profissional indisponível',
  NETWORK_ERROR: 'Sem conexão com o servidor',
};

export const bookingErrorTitle = (error: Error): string =>
  (error instanceof ApiError && TITLES[error.code]) || 'Não foi possível agendar';
