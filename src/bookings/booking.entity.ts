import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Showtime } from '../showtime/showtime.entity';
import { Ticket } from '../ticket/ticket.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ nullable: true })
  userID?: string;

  @Column({ nullable: true })
  guestEmail?: string;

  @Column()
  showtimeID?: number;

  @ManyToOne(() => Showtime)
  @JoinColumn({ name: 'showtimeID' })
  showtime?: Showtime;

  @Column({ type: 'int' })
  amount?: number;

  @Column({ type: 'int' })
  amountReduced?: number;

  @Column({ type: 'timestamp with time zone' })
  datetime?: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userID' })
  user?: User;

  @Column({ type: 'int', nullable: true })
  glasses?: number;

  @OneToMany(() => Ticket, (ticket) => ticket.booking)
  tickets?: Ticket[];
}
