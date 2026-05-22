import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { Showtime } from '../showtime/showtime.entity';
import { User } from '../users/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({ relations: ['user', 'showtime'] });
  }

  async findByUserId(userID: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { userID },
      relations: ['showtime'],
      order: { datetime: 'ASC' },
    });
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'showtime'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async searchBookings(options: { userID?: string; guestEmail?: string; date?: Date }): Promise<Booking[]> {
    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.showtime', 'showtime');

    if (options.userID) {
      query.andWhere('booking.userID = :userID', { userID: options.userID });
    }
    if (options.guestEmail) {
      query.andWhere('booking.guestEmail = :guestEmail', { guestEmail: options.guestEmail });
    }
    if (options.date) {
      const startOfDay = new Date(options.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(options.date);
      endOfDay.setHours(23, 59, 59, 999);
      query.andWhere('showtime.starttime BETWEEN :start AND :end', { start: startOfDay, end: endOfDay });
    }

    return query.getMany();
  }

  async create(
    showtimeID: number,
    amount: number,
    amountReduced: number,
    datetime: Date,
    userID?: string,
    guestEmail?: string,
    glasses?: number,
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
      showtimeID,
      amount,
      amountReduced,
      datetime,
      glasses,
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