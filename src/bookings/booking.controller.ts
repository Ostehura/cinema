import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Delete,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking } from './booking.entity';
import { UserRole } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

interface RequestWithUser {
  user?: { userId: string; role: string };
}

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllBookings(): Promise<Booking[]> {
    return this.bookingService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getBookingsByUser(@Param('userId') userId: string): Promise<Booking[]> {
    return this.bookingService.findByUserId(userId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getUserBookings(
    @Param('userId') userId: string,
    @Request() req: RequestWithUser,
  ): Promise<{ future: Booking[]; past: Booking[] }> {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    const bookings = await this.bookingService.findByUserId(req.user.userId);
    const curent = bookings.filter((booking) => {
      return booking.showtime.starttime >= new Date();
    });
    const past = bookings.filter((booking) => {
      return booking.showtime.starttime < new Date();
    });
    return { future: curent, past: past };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  async getBookingById(@Param('id') id: string): Promise<Booking> {
    return this.bookingService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @Body()
    body: {
      showtimeID: number;
      amount: number;
      amountReduced: number;
      datetime: string;
      userID?: string;
      guestEmail?: string;
      glasses?: number;
    },
  ): Promise<Booking> {
    return this.bookingService.create(
      body.showtimeID,
      body.amount,
      body.amountReduced,
      new Date(body.datetime),
      body.userID,
      body.guestEmail,
      body.glasses,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  async deleteBooking(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const booking = await this.bookingService.findById(id);
    if (!req.user) {
      throw new UnauthorizedException('User have no access to page!');
    }
    if (String(req.user.role) === String(UserRole.ADMIN)) {
      await this.bookingService.delete(id);
    } else if (
      String(req.user.role) === String(UserRole.CUSTOMER) &&
      booking.userID === req.user.userId
    ) {
      await this.bookingService.delete(id);
    }

    return { message: 'Booking deleted successfully' };
  }
}
