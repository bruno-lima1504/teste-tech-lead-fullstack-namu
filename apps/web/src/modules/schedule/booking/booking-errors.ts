import { ApiError } from '@/modules/shared/api-client';

// O texto vem da API (já pensado para o usuário); aqui só o título do alerta, por código.
const TITLES: Record<string, string> = {
  SLOT_UNAVAILABLE: 'Horário ocupado',
  BOOKING_OVERLAP: 'Conflito de horário',
  SLOT_IN_PAST: 'Horário indisponível',
  SLOT_NOT_FOUND: 'Horário indisponível',
  PROFESSIONAL_INACTIVE: 'Profissional indisponível',
  BOOKING_NOT_FOUND: 'Sessão não encontrada',
  BOOKING_ALREADY_CANCELLED: 'Sessão já cancelada',
  CANCELLATION_WINDOW_CLOSED: 'Fora do prazo de cancelamento',
  NETWORK_ERROR: 'Sem conexão com o servidor',
};

export const bookingErrorTitle = (error: Error, fallback = 'Não foi possível agendar'): string =>
  (error instanceof ApiError && TITLES[error.code]) || fallback;
