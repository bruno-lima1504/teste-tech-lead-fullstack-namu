import { TZDate } from '@date-fns/tz';
import { formatISO } from 'date-fns';

export const SAO_PAULO_TIME_ZONE = 'America/Sao_Paulo';

const CALENDAR_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface DateRange {
  start: Date;
  end: Date;
}

export const saoPauloDayRange = (day: string): DateRange => {
  const match = CALENDAR_DAY.exec(day);
  if (!match) {
    throw new Error(`Dia fora do formato AAAA-MM-DD: ${day}`);
  }
  const [year, month, date] = match.slice(1).map(Number) as [number, number, number];
  return {
    start: new Date(new TZDate(year, month - 1, date, SAO_PAULO_TIME_ZONE).getTime()),
    end: new Date(new TZDate(year, month - 1, date + 1, SAO_PAULO_TIME_ZONE).getTime()),
  };
};

export const toSaoPauloIso = (instant: Date): string =>
  formatISO(new TZDate(instant, SAO_PAULO_TIME_ZONE));
