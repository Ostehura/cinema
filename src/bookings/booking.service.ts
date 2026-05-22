import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { Cart, CartItem, TicketType } from 'src/cart/cart.entity';
import { Ticket } from 'src/ticket/ticket.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private dataSource: DataSource,
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

  async searchBookings(options: {
    userID?: string;
    guestEmail?: string;
    date?: Date;
  }): Promise<Booking[]> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.showtime', 'showtime');

    if (options.userID) {
      query.andWhere('booking.userID = :userID', { userID: options.userID });
    }
    if (options.guestEmail) {
      query.andWhere('booking.guestEmail = :guestEmail', {
        guestEmail: options.guestEmail,
      });
    }
    if (options.date) {
      const startOfDay = new Date(options.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(options.date);
      endOfDay.setHours(23, 59, 59, 999);
      query.andWhere('showtime.starttime BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
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

  async placeBooking(
    userId: string | null,
    guestId: string | null,
    guestEmail: string | null,
  ) {
    if (!userId && !guestId) {
      throw new UnauthorizedException('User unauthorized');
    }
    if (!userId && guestId && !guestEmail) {
      throw new BadRequestException('Email is required to place booking.');
    }
    const booking: Booking[] = await this.dataSource.transaction(
      async (manager) => {
        const bookings: Booking[] = [];
        let cart: Cart | null = null;
        if (userId) {
          cart = await manager.findOne(Cart, {
            where: { user: { id: userId } },
          });
        } else if (guestId) {
          cart = await manager.findOne(Cart, {
            where: { guestId },
          });
        }
        if (!cart) {
          throw new NotFoundException('Cart not found');
        }

        const seansIds: number[] = [
          ...new Set(
            (
              await manager.find(CartItem, {
                where: { cartId: cart.id },
                select: { seansId: true },
              })
            ).map((cartItem: CartItem) => {
              return cartItem.seansId;
            }),
          ),
        ];
        for (let i = 0; i < seansIds.length; i++) {
          const cartItem = await manager.find(CartItem, {
            where: { cartId: cart.id, seansId: seansIds[i] },
          });
          const reducedAmount = cartItem.filter((ticket) => {
            return ticket.ticketType == TicketType.REDUCED;
          }).length;
          const booking: Booking = manager.create(Booking, {
            amountReduced: reducedAmount,
            userID: userId ?? null,
            guestEmail: guestId ? guestEmail : null,
            showtimeID: seansIds[i],
            amount: cartItem.length - reducedAmount,
          });
          const savedBooking = await manager.save(booking);
          if (!savedBooking) {
            throw new InternalServerErrorException('Can not create reseration');
          }
          for (let j = 0; j < cartItem.length; j++) {
            const ticket = manager.create(Ticket, {
              bookingID: savedBooking.id,
              showtimeID: savedBooking.showtimeID,
              seatRow: cartItem[j].row,
              seatNumber: cartItem[j].column,
              ticketType: cartItem[j].ticketType,
            });
            await manager.insert(Ticket, ticket);
          }
          bookings.push(savedBooking);
        }
        await manager.delete(CartItem, { cartId: cart.id });
        return bookings;
      },
    );
    return booking;
  }
}
