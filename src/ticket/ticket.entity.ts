import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Booking } from '../bookings/booking.entity';
import { Showtime } from '../showtime/showtime.entity';


export enum TicketType {
  FULL = 'full',
  REDUCED = 'reduced',
}

@Entity()
export class Ticket {
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
  seatRow!: number;

  @PrimaryColumn({ type: 'int' })
  seatNumber!: number;

  @Column({ type: 'enum', enum: TicketType })
  ticketType?: TicketType;
}