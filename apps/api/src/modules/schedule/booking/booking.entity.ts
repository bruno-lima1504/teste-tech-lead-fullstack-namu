import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Slot } from '../slot/slot.entity';
import { User } from '../user/user.entity';
import { BookingStatus } from './booking.types';

// Nomes de FK e índice iguais aos que o MySQL gerou para o seed: assim o db:generate não os recria.
@Index('slot_id', ['slotId'])
@Index('user_id', ['userId'])
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
}
