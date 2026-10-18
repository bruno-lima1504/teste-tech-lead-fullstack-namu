'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Alert } from '@/modules/shared/alert';
import { useCurrentUser } from '@/modules/shared/current-user';
import { formatCalendarParts, formatDate, formatTime } from '@/modules/shared/sao-paulo-time';
import { SEED_USERS } from '@/modules/shared/seed-users';
import { CalendarClock, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';
import { SPECIALTY_META } from '../professional/professional-picker';
import { SPECIALTY_LABELS } from '../professional/professional.types';
import { useMyBookings } from './booking.queries';
import type { BookingStatus } from './booking.types';

const STATUS = {
  confirmed: {
    label: 'Confirmada',
    variant: 'success' as const,
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelada',
    variant: 'muted' as const,
    icon: XCircle,
  },
} satisfies Record<
  BookingStatus,
  { label: string; variant: 'success' | 'muted'; icon: typeof CheckCircle2 }
>;

type FilterTab = 'all' | BookingStatus;

export function MyBookings() {
  const { userId } = useCurrentUser();
  const activeUser = SEED_USERS.find(({ id }) => id === userId) ?? SEED_USERS[0];
  const bookings = useMyBookings(userId);
  const [filter, setFilter] = useState<FilterTab>('all');

  const allBookings = bookings.data ?? [];
  const confirmedCount = allBookings.filter((item) => item.status === 'confirmed').length;
  const cancelledCount = allBookings.filter((item) => item.status === 'cancelled').length;

  const visibleBookings =
    filter === 'all' ? allBookings : allBookings.filter((item) => item.status === filter);

  return (
    <section aria-labelledby="minhas-sessoes">
      <Card>
        <CardHeader className="bg-muted/40 border-b">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>
              <h2 id="minhas-sessoes" className="text-lg font-bold">
                Minhas sessões
              </h2>
            </CardTitle>
            {bookings.data && (
              <Badge variant={confirmedCount > 0 ? 'secondary' : 'muted'}>
                {confirmedCount === 1 ? '1 confirmada' : `${confirmedCount} confirmadas`}
              </Badge>
            )}
          </div>
          <CardDescription>{`Agenda de ${activeUser.name}`}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pt-1">
          {bookings.isPending && (
            <div className="flex flex-col gap-3" aria-busy="true">
              <p className="sr-only">Carregando suas sessões…</p>
              {[1, 2].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border p-3.5">
                  <Skeleton className="h-14 w-13 rounded-xl" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {bookings.isError && (
            <Alert tone="error" title="Não foi possível carregar suas sessões">
              {bookings.error.message}
            </Alert>
          )}

          {bookings.data?.length === 0 && (
            <div className="bg-muted/50 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-10 text-center">
              <div className="bg-accent text-primary-deep dark:text-primary-glow flex size-11 items-center justify-center rounded-xl">
                <CalendarClock className="size-6" />
              </div>
              <p className="text-sm font-semibold">Você ainda não tem sessões agendadas.</p>
              <p className="text-muted-foreground text-xs">
                Suas sessões aparecerão aqui assim que você confirmar um horário ao lado.
              </p>
            </div>
          )}

          {allBookings.length > 0 && (
            <>
              {cancelledCount > 0 && (
                <Tabs
                  value={filter}
                  onValueChange={(value) => setFilter(value as FilterTab)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">{`Todas (${allBookings.length})`}</TabsTrigger>
                    <TabsTrigger value="confirmed">{`Ativas (${confirmedCount})`}</TabsTrigger>
                    <TabsTrigger value="cancelled">{`Canceladas (${cancelledCount})`}</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              <ul className="flex flex-col gap-3">
                {visibleBookings.map(({ id, status, cancelledAt, slot }) => {
                  const calendar = formatCalendarParts(slot.startsAt);
                  const meta = SPECIALTY_META[slot.professional.specialty];
                  const SpecialtyIcon = meta.icon;
                  const StatusIcon = STATUS[status].icon;
                  const isCancelled = status === 'cancelled';

                  return (
                    <li
                      key={id}
                      className={cn(
                        'flex items-start gap-3.5 rounded-2xl border p-3.5 transition-all',
                        isCancelled
                          ? 'bg-muted/30 opacity-75'
                          : 'bg-card hover:border-primary/30 shadow-2xs',
                      )}
                    >
                      <div
                        className={cn(
                          'flex w-13 shrink-0 flex-col items-center justify-center rounded-xl border py-1.5 text-center',
                          isCancelled
                            ? 'bg-muted text-muted-foreground'
                            : 'border-primary/25 bg-accent text-primary-deep dark:text-primary-glow',
                        )}
                        aria-hidden="true"
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          {calendar.weekday}
                        </span>
                        <span className="text-base font-bold leading-tight tabular-nums">
                          {calendar.day}
                        </span>
                        <span className="text-[10px] font-medium uppercase">{calendar.month}</span>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-semibold leading-snug">
                            {slot.professional.name}
                          </p>
                          <p className="text-muted-foreground inline-flex items-center gap-1 text-xs tabular-nums">
                            <Clock className="size-3" />
                            {`${formatDate(slot.startsAt)} · ${formatTime(slot.startsAt)}–${formatTime(slot.endsAt)}`}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn('px-2 py-0 text-[11px]', meta.badgeClass)}
                          >
                            <SpecialtyIcon className="size-3" />
                            {SPECIALTY_LABELS[slot.professional.specialty]}
                          </Badge>

                          <Badge variant={STATUS[status].variant} className="gap-1 text-[11px]">
                            <StatusIcon className="size-3" />
                            {STATUS[status].label}
                            {cancelledAt && ` em ${formatDate(cancelledAt)}`}
                          </Badge>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
