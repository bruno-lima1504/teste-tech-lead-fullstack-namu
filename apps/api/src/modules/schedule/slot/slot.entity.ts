import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Professional } from '../professional/professional.entity';

@Index('uq_slots_professional_starts', ['professionalId', 'startsAt'], { unique: true })
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
