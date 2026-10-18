'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/modules/shared/alert';
import { ApiError } from '@/modules/shared/api-client';
import { useCurrentUser } from '@/modules/shared/current-user';
import { formatDate, formatTime, useTodayInSaoPaulo } from '@/modules/shared/sao-paulo-time';
import { SEED_USERS } from '@/modules/shared/seed-users';
import { CalendarCheck, Clock, Sparkles, UserCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ProfessionalPicker } from '../professional/professional-picker';
import { SPECIALTY_LABELS, type Professional } from '../professional/professional.types';
import { SlotPicker } from '../slot/slot-picker';
import type { Slot } from '../slot/slot.types';
import { bookingErrorTitle } from './booking-errors';
import { useCreateBooking } from './booking.queries';

const when = (slot: Slot) => `${formatDate(slot.startsAt)} às ${formatTime(slot.startsAt)}`;

export function BookingPanel() {
  const { userId } = useCurrentUser();
  const activeUser = SEED_USERS.find(({ id }) => id === userId) ?? SEED_USERS[0];
  const today = useTodayInSaoPaulo();
  const [professional, setProfessional] = useState<Professional>();
  const [chosenDate, setChosenDate] = useState<string>();
  // Profissional e dia continuam ao trocar de usuário (os horários livres são os mesmos
  // para todos); o horário escolhido e o resultado do agendamento valem só para quem os fez.
  const [selection, setSelection] = useState<{ userId: number; slot: Slot }>();
  const createBooking = useCreateBooking();
  const date = chosenDate ?? today;
  const slot = selection?.userId === userId ? selection.slot : undefined;
  const isOwnResult = createBooking.variables?.userId === userId;

  const chooseProfessional = (value: Professional | undefined) => {
    setProfessional(value);
    setSelection(undefined);
    createBooking.reset();
  };

  const chooseDate = (value: string) => {
    setChosenDate(value);
    setSelection(undefined);
    createBooking.reset();
  };

  const chooseSlot = (value: Slot) => {
    setSelection({ userId, slot: value });
    createBooking.reset();
  };

  const confirm = (event: FormEvent) => {
    event.preventDefault();
    if (slot) {
      createBooking.mutate(
        { userId, slotId: slot.id },
        {
          onSuccess: () => setSelection(undefined),
          // Recusado pela API, o horário não serve mais (ocupado, conflito…); com falha de
          // rede ele continua escolhido para tentar de novo.
          onError: (error) => {
            if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
              setSelection(undefined);
            }
          },
        },
      );
    }
  };

  return (
    <section aria-labelledby="agendar">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/40 border-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>
              <h2 id="agendar" className="text-lg font-bold">
                Agendar uma sessão
              </h2>
            </CardTitle>
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="size-3" />3 passos simples
            </Badge>
          </div>
          <CardDescription>
            Selecione o especialista, consulte os horários livres e confirme seu atendimento.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-1">
          <form onSubmit={confirm} className="flex flex-col gap-6">
            <ProfessionalPicker selectedId={professional?.id} onSelect={chooseProfessional} />

            <Separator />

            <SlotPicker
              professionalId={professional?.id}
              today={today}
              date={date}
              onDateChange={chooseDate}
              selectedSlotId={slot?.id}
              onSelect={chooseSlot}
            />

            <Separator />

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <span className="bg-gradient-primary text-primary-foreground shadow-primary flex size-6 items-center justify-center rounded-full text-xs font-bold">
                  3
                </span>
                <p className="text-base font-bold tracking-tight">Confirme</p>
              </div>

              <div className="bg-accent/40 border-primary/20 flex flex-col justify-between gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-1">
                  {professional && slot ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold">{professional.name}</span>
                        <Badge variant="secondary" className="text-[11px]">
                          {SPECIALTY_LABELS[professional.specialty]}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                        <Clock className="text-primary-deep dark:text-primary size-3.5" />
                        <span>
                          {`${when(slot)}–${formatTime(slot.endsAt)} (${professional.sessionMinutes} min)`}
                        </span>
                      </p>
                      <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                        <UserCheck className="size-3.5" />
                        <span>{`Paciente: ${activeUser.name}`}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold">Resumo do agendamento</p>
                      <p className="text-muted-foreground text-sm">
                        {professional
                          ? 'Escolha um horário livre no passo 2 para revisar e confirmar.'
                          : 'Escolha o profissional e um horário livre.'}
                      </p>
                    </>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={!slot || createBooking.isPending}
                  className="w-full shrink-0 sm:w-auto"
                >
                  <CalendarCheck className="size-4" />
                  {createBooking.isPending ? 'Agendando…' : 'Confirmar agendamento'}
                </Button>
              </div>

              {isOwnResult && createBooking.isError && (
                <Alert tone="error" title={bookingErrorTitle(createBooking.error)}>
                  {createBooking.error.message}
                </Alert>
              )}
              {isOwnResult && createBooking.isSuccess && (
                <Alert tone="success" title="Sessão agendada">
                  {`${createBooking.data.slot.professional.name} · ${when(createBooking.data.slot)}`}
                </Alert>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
