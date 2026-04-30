import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';


@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userID: string;

  @Column({ nullable: true })
  guestEmail: string;

  @Column()
  seansID: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'int' })
  amountReduced: number;

  @Column({ type: 'timestamp with time zone' })
  dateTime: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userID' })
  user?: User;

  @Column({type: 'int'})
  glasses: number;
}
