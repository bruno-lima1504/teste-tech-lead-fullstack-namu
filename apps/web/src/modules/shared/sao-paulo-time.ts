import { useSyncExternalStore } from 'react';

// Os horários são exibidos sempre no fuso de São Paulo, qualquer que seja o fuso do navegador.
const TIME_ZONE = 'America/Sao_Paulo';

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  day: '2-digit',
  month: 'short',
});
const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});
const weekdayShortFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  weekday: 'short',
});
const dayNumberFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  day: '2-digit',
});
const monthShortFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  month: 'short',
});

/** Dia de hoje em São Paulo, AAAA-MM-DD (o formato do parâmetro `date` da API). */
export const todayInSaoPaulo = (): string => dayFormatter.format(new Date());

export const formatDate = (iso: string): string => dateFormatter.format(new Date(iso));

export const formatTime = (iso: string): string => timeFormatter.format(new Date(iso));

export interface CalendarDayParts {
  weekday: string;
  day: string;
  month: string;
}

export const formatCalendarParts = (iso: string): CalendarDayParts => {
  const date = new Date(iso);
  return {
    weekday: weekdayShortFormatter.format(date).replace('.', ''),
    day: dayNumberFormatter.format(date),
    month: monthShortFormatter.format(date).replace('.', ''),
  };
};

export interface QuickDateOption {
  value: string;
  label: string;
  dayNumber: string;
  monthShort: string;
}

/** Gera os próximos `count` dias a partir de `today` (AAAA-MM-DD) no calendário de São Paulo. */
export const upcomingDaysFrom = (today: string, count = 7): QuickDateOption[] => {
  if (!today) return [];
  const [year, month, day] = today.split('-').map(Number);
  if (!year || !month || !day) return [];

  return Array.from({ length: count }, (_, index) => {
    // 12:00 UTC corresponde a 09:00 em São Paulo, longe de qualquer virada de dia.
    const instant = new Date(Date.UTC(year, month - 1, day + index, 12, 0, 0));
    const value = dayFormatter.format(instant);
    const weekday = weekdayShortFormatter.format(instant).replace('.', '');
    const dayNumber = dayNumberFormatter.format(instant);
    const monthShort = monthShortFormatter.format(instant).replace('.', '');

    return {
      value,
      label: index === 0 ? 'Hoje' : index === 1 ? 'Amanhã' : weekday,
      dayNumber,
      monthShort,
    };
  });
};

const noSubscription = () => () => {};

/** Hoje em São Paulo, lido só no navegador: no servidor (pré-render) é ''. */
export const useTodayInSaoPaulo = (): string =>
  useSyncExternalStore(noSubscription, todayInSaoPaulo, () => '');
