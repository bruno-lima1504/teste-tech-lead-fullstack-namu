import { apiFetch } from '@/modules/shared/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SLOTS_QUERY_KEY } from '../slot/slot.queries';
import type { Booking } from './booking.types';

const BOOKINGS_QUERY_KEY = ['bookings'] as const;

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
    // Agendado ou recusado, os horários livres e as sessões podem ter mudado, inclusive por
    // outra pessoa (é o caso do SLOT_UNAVAILABLE): recarrega os dois.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: SLOTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY }),
      ]),
  });
};
