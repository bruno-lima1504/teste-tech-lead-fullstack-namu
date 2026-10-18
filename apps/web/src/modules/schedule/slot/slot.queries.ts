import { apiFetch } from '@/modules/shared/api-client';
import { useQuery } from '@tanstack/react-query';
import type { Slot } from './slot.types';

export const SLOTS_QUERY_KEY = ['slots'] as const;

/** Horários livres do profissional no dia (AAAA-MM-DD de São Paulo); sem profissional ou dia, não busca. */
export const useAvailableSlots = (professionalId: number | undefined, date: string) =>
  useQuery({
    queryKey: [...SLOTS_QUERY_KEY, professionalId, date],
    queryFn: () => apiFetch<Slot[]>(`/professionals/${professionalId}/slots`, { query: { date } }),
    enabled: professionalId !== undefined && date !== '',
  });
