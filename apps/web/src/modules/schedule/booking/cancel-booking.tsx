'use client';

import { Button } from '@/components/ui/button';
import { Alert } from '@/modules/shared/alert';
import { useCurrentUser } from '@/modules/shared/current-user';
import { useState } from 'react';
import { bookingErrorTitle } from './booking-errors';
import { useCancelBooking } from './booking.queries';

// O botão fica ativo mesmo dentro das 24 horas: o prazo é regra da API, e a recusa aparece no alerta.
export function CancelBooking({ bookingId }: { bookingId: number }) {
  const { userId } = useCurrentUser();
  const cancelBooking = useCancelBooking();
  const [confirming, setConfirming] = useState(false);

  const askConfirmation = () => {
    cancelBooking.reset();
    setConfirming(true);
  };

  const cancel = () =>
    cancelBooking.mutate({ userId, bookingId }, { onSettled: () => setConfirming(false) });

  return (
    <div className="flex flex-col gap-2 border-t pt-2.5">
      {confirming ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Cancelar esta sessão?</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={cancelBooking.isPending}
              onClick={() => setConfirming(false)}
            >
              Voltar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={cancelBooking.isPending}
              onClick={cancel}
            >
              {cancelBooking.isPending ? 'Cancelando…' : 'Sim, cancelar'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">Cancelamento até 24h antes do início</p>
          <Button size="sm" variant="outline" onClick={askConfirmation}>
            Cancelar
          </Button>
        </div>
      )}

      {cancelBooking.isError && (
        <Alert
          tone="error"
          title={bookingErrorTitle(cancelBooking.error, 'Não foi possível cancelar')}
        >
          {cancelBooking.error.message}
        </Alert>
      )}
    </div>
  );
}
