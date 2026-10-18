import { apiFetch } from '@/modules/shared/api-client';
import { useQuery } from '@tanstack/react-query';
import type { Professional, Specialty } from './professional.types';

export const useProfessionals = (specialty?: Specialty) =>
  useQuery({
    queryKey: ['professionals', specialty ?? 'todas'],
    queryFn: () => apiFetch<Professional[]>('/professionals', { query: { specialty } }),
  });
