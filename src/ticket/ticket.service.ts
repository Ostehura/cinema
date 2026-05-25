import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketType } from './ticket.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find({ relations: ['booking', 'showtime'] });
  }

  async findByBookingId(bookingID: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { bookingID },
      order: { seatRow: 'ASC' },
    });
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['booking', 'showtime'],
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async create(
    bookingID: string,
    showtimeID: number,
    seatRow: number,
    seatNumber: number,
    ticketType: TicketType,
  ): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      bookingID,
      showtimeID,
      seatRow,
      seatNumber,
      ticketType,
    });
    return this.ticketRepository.save(ticket);
  }

  async delete(id: string): Promise<void> {
    const result = await this.ticketRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Ticket not found');
    }
  }
  async getTakenSeatsPerShowtime(showtimeId: number) {
    return await this.ticketRepository.find({
      where: { showtimeID: showtimeId },
    });
  }
}
