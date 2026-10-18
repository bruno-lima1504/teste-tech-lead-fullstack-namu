import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Professional } from '../professional/professional.entity';

// Nome do índice que o MySQL criou para a FK no seed: assim o db:generate não o recria.
@Index('professional_id', ['professionalId'])
@Entity({ name: 'availability_slots' })
export class Slot {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'professional_id', type: 'int' })
  professionalId: number;

  @ManyToOne(() => Professional)
  @JoinColumn({ name: 'professional_id', foreignKeyConstraintName: 'availability_slots_ibfk_1' })
  professional?: Professional;

  @Column({ name: 'starts_at', type: 'datetime', comment: 'UTC' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'datetime', comment: 'UTC' })
  endsAt: Date;
}
