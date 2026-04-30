import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({ relations: ['user', 'seans'] });
  }

  async findByUserId(userID: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { userID },
      relations: ['seans'],
      order: { dateTime: 'ASC' },
    });
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'seans'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async create(
    seansID: string,
    amount: number,
    amountReduced: number,
    dateTime: Date,
    userID?: string,
    guestEmail?: string,
  ): Promise<Booking> {
    if (amount < 1 || amount > 4) {
      throw new BadRequestException('Amount must be between 1 and 4');
    }

    const totalTickets = amount + amountReduced;
    if (totalTickets < 1 || totalTickets > 4) {
      throw new BadRequestException('Total tickets must be between 1 and 4');
    }

    const booking = this.bookingRepository.create({
      userID,
      guestEmail,
      seansID,
      amount,
      amountReduced,
      dateTime,
    });
    return this.bookingRepository.save(booking);
  }

  async delete(id: string): Promise<void> {
    const result = await this.bookingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Booking not found');
    }
  }
}
