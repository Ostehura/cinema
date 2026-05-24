import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { Showtime } from '../showtime/showtime.entity';

export enum TicketType {
  REDUCED = 'Reduced',
  FULL = 'Full',
}

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingID?: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingID' })
  booking?: Booking;

  @Column()
  showtimeID: number;

  @ManyToOne(() => Showtime)
  @JoinColumn({ name: 'showtimeID' })
  showtime?: Showtime;

  @Column({ type: 'int' })
  seatRow: number;

  @Column({ type: 'int' })
  seatNumber: number;

  @Column({ type: 'enum', enum: TicketType })
  ticketType?: TicketType;
}