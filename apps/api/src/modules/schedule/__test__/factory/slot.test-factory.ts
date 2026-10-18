import * as Factory from 'factory.ts';

/** Linha da tabela availability_slots, como o knex insere. */
export interface SlotRow {
  professional_id: number;
  starts_at: Date;
  ends_at: Date;
}

const HOUR = 60 * 60 * 1000;

// Por padrão, um horário de 1h daqui a 30 dias (futuro e longe dos horários do seed).
export const slotRowFactory = Factory.Sync.makeFactory<SlotRow>({
  professional_id: 1,
  starts_at: Factory.each(() => new Date(Date.now() + 30 * 24 * HOUR)),
  ends_at: Factory.each(() => new Date(Date.now() + 30 * 24 * HOUR + HOUR)),
});
