import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// O nome do índice é o que o MySQL deu ao UNIQUE do seed.
@Index('email', ['email'], { unique: true })
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;
}
