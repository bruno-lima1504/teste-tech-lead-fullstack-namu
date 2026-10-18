import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Specialty } from './professional.types';

@Entity({ name: 'professionals' })
export class Professional {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: Specialty })
  specialty: Specialty;

  @Column({ name: 'session_minutes', type: 'int' })
  sessionMinutes: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
