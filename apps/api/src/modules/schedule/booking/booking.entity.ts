import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Slot } from '../slot/slot.entity';
import { User } from '../user/user.entity';
import { BookingStatus } from './booking.types';

// Nomes de FK e índice iguais aos que o MySQL gerou para o seed: assim o db:generate não os recria.
@Index('slot_id', ['slotId'])
@Index('idx_bookings_user_status', ['userId', 'status'])
@Index('uq_bookings_confirmed_slot', ['confirmedSlotId'], { unique: true })
@Entity({ name: 'bookings' })
export class Booking {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'slot_id', type: 'int' })
  slotId: number;

  @ManyToOne(() => Slot)
  @JoinColumn({ name: 'slot_id', foreignKeyConstraintName: 'bookings_ibfk_1' })
  slot?: Slot;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'bookings_ibfk_2' })
  user?: User;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.Confirmed })
  status: BookingStatus;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'UTC',
  })
  createdAt: Date;

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true, comment: 'UTC' })
  cancelledAt: Date | null;

  @Column({
    name: 'confirmed_slot_id',
    type: 'int',
    nullable: true,
    generatedType: 'STORED',
    asExpression: `IF(status = '${BookingStatus.Confirmed}', slot_id, NULL)`,
    insert: false,
    update: false,
    select: false,
  })
  confirmedSlotId: number | null;
}
