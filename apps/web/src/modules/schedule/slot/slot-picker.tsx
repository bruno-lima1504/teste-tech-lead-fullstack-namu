'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Alert } from '@/modules/shared/alert';
import { formatTime, upcomingDaysFrom } from '@/modules/shared/sao-paulo-time';
import { CalendarDays, CalendarX2, Check, Clock, Globe, Sparkles } from 'lucide-react';
import { useAvailableSlots } from './slot.queries';
import type { Slot } from './slot.types';

interface SlotPickerProps {
  professionalId?: number;
  /** Hoje em São Paulo (AAAA-MM-DD); vazio até o navegador calcular. */
  today: string;
  date: string;
  onDateChange: (date: string) => void;
  selectedSlotId?: number;
  onSelect: (slot: Slot) => void;
}

export function SlotPicker({
  professionalId,
  today,
  date,
  onDateChange,
  selectedSlotId,
  onSelect,
}: SlotPickerProps) {
  // AAAA-MM-DD compara certo como texto.
  const dateError =
    date === '' ? 'Informe a data.' : date < today ? 'Escolha uma data a partir de hoje.' : null;
  const slots = useAvailableSlots(professionalId, dateError ? '' : date);
  const quickDays = upcomingDaysFrom(today, 7);

  return (
    <fieldset className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="bg-gradient-primary text-primary-foreground shadow-primary flex size-6 items-center justify-center rounded-full text-xs font-bold">
            2
          </span>
          <legend className="text-base font-bold tracking-tight">Escolha a data e o horário</legend>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Globe className="size-3" />
          Horários de Brasília
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        {quickDays.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">Próximos dias</span>
            <div
              className="grid grid-cols-4 gap-1.5 sm:grid-cols-7"
              role="group"
              aria-label="Atalhos de data"
            >
              {quickDays.map((option) => {
                const isSelected = option.value === date;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onDateChange(option.value)}
                    className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-2xl border px-2 py-2.5 text-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-primary'
                        : 'bg-card hover:border-primary/40 hover:bg-accent/50 text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[11px] font-medium capitalize',
                        isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground',
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="mt-0.5 text-sm font-bold tabular-nums">
                      {option.dayNumber}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-medium uppercase tracking-wider',
                        isSelected ? 'text-primary-foreground/85' : 'text-muted-foreground',
                      )}
                    >
                      {option.monthShort}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="flex flex-col gap-1.5 text-xs font-medium">
            <span className="text-muted-foreground inline-flex items-center gap-1.5">
              <CalendarDays className="text-primary-deep dark:text-primary size-3.5" />
              Data
            </span>
            <Input
              type="date"
              required
              min={today}
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              aria-invalid={dateError !== null && today !== ''}
              className="w-44 rounded-xl tabular-nums"
            />
          </label>
          {dateError && today !== '' && (
            <p role="alert" className="text-destructive text-xs font-medium">
              {dateError}
            </p>
          )}
        </div>
      </div>

      {professionalId === undefined ? (
        <div className="bg-muted/50 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-7 text-center">
          <div className="bg-accent text-primary-deep dark:text-primary-glow flex size-10 items-center justify-center rounded-xl">
            <Sparkles className="size-5" />
          </div>
          <p className="text-muted-foreground text-sm">
            Escolha um profissional para ver os horários livres.
          </p>
        </div>
      ) : (
        !dateError && (
          <>
            {slots.isPending && (
              <div
                className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4"
                aria-busy="true"
              >
                <p className="sr-only">Carregando horários…</p>
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton key={item} className="h-14 rounded-2xl" />
                ))}
              </div>
            )}

            {slots.isError && (
              <Alert tone="error" title="Não foi possível carregar os horários">
                {slots.error.message}
              </Alert>
            )}

            {slots.data?.length === 0 && (
              <div className="bg-muted/50 flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed px-4 py-7 text-center">
                <div className="bg-accent text-primary-deep dark:text-primary-glow flex size-10 items-center justify-center rounded-xl">
                  <CalendarX2 className="size-5" />
                </div>
                <p className="text-sm font-semibold">
                  Nenhum horário livre neste dia. Tente outra data.
                </p>
                <p className="text-muted-foreground text-xs">
                  Use os atalhos acima para navegar pelos próximos dias disponíveis.
                </p>
              </div>
            )}

            {slots.data && slots.data.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium">
                    {slots.data.length === 1
                      ? '1 horário disponível'
                      : `${slots.data.length} horários disponíveis`}
                  </span>
                </div>
                <div
                  className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4"
                  role="group"
                  aria-label="Horários livres"
                >
                  {slots.data.map((slot) => {
                    const isSelected = slot.id === selectedSlotId;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onSelect(slot)}
                        className={cn(
                          'group relative flex cursor-pointer flex-col items-start justify-between rounded-2xl border px-3.5 py-2.5 text-left tabular-nums transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-primary'
                            : 'bg-card hover:border-primary/40 hover:bg-accent/50 text-foreground',
                        )}
                      >
                        <div className="flex w-full items-center justify-between gap-1">
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold">
                            <Clock
                              className={cn(
                                'size-3.5',
                                isSelected
                                  ? 'text-primary-foreground'
                                  : 'text-primary-deep dark:text-primary',
                              )}
                            />
                            {formatTime(slot.startsAt)}
                          </span>
                          {isSelected && <Check className="size-3.5 stroke-[2.5]" />}
                        </div>
                        <span
                          className={cn(
                            'mt-0.5 text-[11px]',
                            isSelected ? 'text-primary-foreground/85' : 'text-muted-foreground',
                          )}
                        >
                          {`até ${formatTime(slot.endsAt)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )
      )}
    </fieldset>
  );
}
