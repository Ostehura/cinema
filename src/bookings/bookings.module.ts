import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './booking.entity';
import { TicketService } from '../ticket/ticket.service';
import { TicketController } from '../ticket/ticket.controller';
import { Ticket } from '../ticket/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Ticket])],
  controllers: [BookingController, TicketController],
  providers: [BookingService, TicketService],
  exports: [BookingService, TicketService],
})
export class BookingsModule {}