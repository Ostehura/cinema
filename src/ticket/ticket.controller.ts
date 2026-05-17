import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Ticket, TicketType } from './ticket.entity';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllTickets(): Promise<Ticket[]> {
    return this.ticketService.findAll();
  }

  @Get('booking/:bookingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTicketsByBooking(
    @Param('bookingId') bookingId: string,
  ): Promise<Ticket[]> {
    return this.ticketService.findByBookingId(bookingId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTicketById(@Param('id') id: string): Promise<Ticket> {
    return this.ticketService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTicket(
    @Body()
    body: {
      bookingID: string;
      showtimeID: number;
      seatRow: number;
      seatNumber: number;
      ticketType: TicketType;
    },
  ): Promise<Ticket> {
    return this.ticketService.create(
      body.bookingID,
      body.showtimeID,
      body.seatRow,
      body.seatNumber,
      body.ticketType,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteTicket(@Param('id') id: string): Promise<{ message: string }> {
    await this.ticketService.delete(id);
    return { message: 'Ticket deleted successfully' };
  }
}
