import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { Showtime } from '../showtime/showtime.entity';

export enum TicketType {
  REDUCED = 'Reduced',
  FULL = 'Full',
}

@Entity()
export class Ticket {
  @Column('uuid')
  id?: string;

  @Column()
  bookingID?: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingID' })
  booking?: Booking;

  @PrimaryColumn()
  showtimeID?: number;

  @ManyToOne(() => Showtime)
  @JoinColumn({ name: 'showtimeID' })
  showtime?: Showtime;

  @PrimaryColumn({ type: 'int' })
  seatRow?: number;

  @PrimaryColumn({ type: 'int' })
  seatNumber?: number;

  @Column({ type: 'enum', enum: TicketType })
  ticketType?: TicketType;
}
