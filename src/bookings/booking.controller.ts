import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  Render,
  Redirect,
  Request,
  Res,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking } from './booking.entity';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { OptionalJwtAuthGuard } from 'src/auth/optionalauth.guard';

import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

interface RequestWithUser {
  user?: { userId: string; role: string };
}

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('booking/index')
  async listBookings(
    @Query() query: { userID: string; guestEmail: string; datetime: string },
  ) {
    const bookings = await this.bookingService.searchBookings([
      {
        userID: query.userID && query.userID != '' ? query.userID : undefined,
        guestEmail:
          query.guestEmail && query.guestEmail != ''
            ? query.guestEmail
            : undefined,
        datetime:
          query.datetime && query.datetime != ''
            ? new Date(query.datetime)
            : undefined,
      },
      {
        userID: query.userID && query.userID != '' ? query.userID : undefined,
        user:
          query.guestEmail && query.guestEmail
            ? { email: query.guestEmail }
            : undefined,
        datetime:
          query.datetime && query.datetime != ''
            ? new Date(query.datetime)
            : undefined,
      },
    ]);
    return { bookings, activePage: '/booking' };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('booking/search')
  searchForm() {
    return {};
  }

  @Get('view')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('booking/view')
  async view() {
    const bookings = await this.bookingService.findAll();
    return { bookings };
  }

  @Get('error')
  @Render('error')
  error() {
    return {
      statusCode: '403',
      message:
        'Access Forbidden: You do not have permission to perform this action or the booking cannot be deleted due to timing restrictions.',
    };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('booking/user')
  async userBookings(@Param('userId') userId: string) {
    const bookings = await this.bookingService.findByUserId(userId);
    return { bookings, userId };
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  @Render('booking/user')
  async myBookings(@Request() req: RequestWithUser) {
    if (!req.user) {
      throw new Error('User not found');
    }
    const bookings = await this.bookingService.findByUserId(req.user.userId);
    return { bookings, userId: req.user.userId, userRole: req.user.role };
  }

  @Get('my')
  @Render('my-bookings')
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
  @UseGuards(OptionalJwtAuthGuard)
  @Render('booking/view')
  async viewBooking(@Param('id') id: string) {
    const booking = await this.bookingService.findById(id);
    return { booking };
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @Render('booking/viewAdmin')
  async viewBookingAdmin(@Param('id') id: string) {
    const booking = await this.bookingService.findById(id);
    return { booking };
  }

  @Get('new')
  @UseGuards(JwtAuthGuard)
  @Render('booking/new')
  newBookingForm() {
    return {};
  }

  @Post('new')
  @UseGuards(JwtAuthGuard)
  @Redirect('booking')
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
  ) {
    await this.bookingService.create(
      body.showtimeID,
      body.amount,
      body.amountReduced,
      new Date(body.datetime),
      body.userID,
      body.guestEmail,
      body.glasses,
    );
    return { url: '/booking' };
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  async deleteBooking(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Res() res,
  ) {
    try {
      const booking = await this.bookingService.findById(id);

      if (!req.user) {
        throw new UnauthorizedException();
      }

      if (booking.showtime) {
        const showtime = new Date(booking.showtime.starttime);
        const hoursDifference =
          (showtime.getTime() - Date.now()) / (1000 * 60 * 60);

        if (hoursDifference < 4) {
          throw new ForbiddenException(
            'Booking cannot be deleted less than 4 hours before showtime',
          );
        }
      }

      if (
        req.user.role === UserRole.ADMIN ||
        (req.user.role === UserRole.CUSTOMER &&
          booking.userID === req.user.userId)
      ) {
        await this.bookingService.delete(id);
      } else {
        throw new ForbiddenException(
          'You do not have permission to delete this booking',
        );
      }

      if (req.user.role === UserRole.ADMIN) {
        return res.redirect('/booking/view');
      } else {
        return res.redirect('/booking/my-bookings');
      }
    } catch (err) {
      return res.redirect(`/booking/error`);
    }
  }
}
