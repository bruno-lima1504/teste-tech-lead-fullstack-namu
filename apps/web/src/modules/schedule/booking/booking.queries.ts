import { apiFetch } from '@/modules/shared/api-client';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { SLOTS_QUERY_KEY } from '../slot/slot.queries';
import type { Booking } from './booking.types';

const BOOKINGS_QUERY_KEY = ['bookings'] as const;

// Depois de agendar ou cancelar, deu certo ou não, os horários livres e as sessões podem ter
// mudado, inclusive por outra pessoa (é o caso do SLOT_UNAVAILABLE): recarrega os dois.
const refreshSchedule = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: SLOTS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY }),
  ]);

export const useMyBookings = (userId: number) =>
  useQuery({
    queryKey: [...BOOKINGS_QUERY_KEY, userId],
    queryFn: () => apiFetch<Booking[]>('/me/bookings', { userId }),
  });

interface CreateBookingInput {
  userId: number;
  slotId: number;
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, slotId }: CreateBookingInput) =>
      apiFetch<Booking>('/bookings', { method: 'POST', userId, body: { slotId } }),
    onSettled: () => refreshSchedule(queryClient),
  });
};

interface CancelBookingInput {
  userId: number;
  bookingId: number;
}

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, bookingId }: CancelBookingInput) =>
      apiFetch<Booking>(`/bookings/${bookingId}`, { method: 'DELETE', userId }),
    onSettled: () => refreshSchedule(queryClient),
  });
};
