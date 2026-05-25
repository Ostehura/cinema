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
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking } from './booking.entity';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

interface RequestWithUser {
  user?: { userId: string; role: string };
}

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

   @Get()
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.ADMIN)
   @Render('bookings/index')
   async listBookings(@Query() query: any) {
     const bookings = await this.bookingService.searchBookings(query.search);
     return { bookings, activePage: '/booking' };
   }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('bookings/search')
  async searchForm() {
    return {};
  }



    @Get('view')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Render('bookings/view')
    async view(){
     const bookings = await this.bookingService.findAll();
     return { bookings };
    }

   @Get('user/:userId')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.ADMIN)
   @Render('bookings/user')
   async userBookings(@Param('userId') userId: string) {
     const bookings = await this.bookingService.findByUserId(userId);
     return { bookings, userId };
   }

   @Get('my-bookings')
   @UseGuards(JwtAuthGuard)
   @Render('bookings/user')
   async myBookings(@Request() req: RequestWithUser) {
     if (!req.user) {
       throw new Error('User not found');
     }
     const bookings = await this.bookingService.findByUserId(req.user.userId);
     return { bookings, userId: req.user.userId };
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
  @Render('bookings/view')
  async viewBooking(@Param('id') id: string) {
    const booking = await this.bookingService.findById(id);
    return { booking };
  }

  @Get('new')
  @UseGuards(JwtAuthGuard)
  @Render('bookings/new')
  async newBookingForm() {
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  async deleteBooking(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const booking = await this.bookingService.findById(id);
    if (!req.user) {
      throw new Error('User have no access to page!');
    }
    
    // Check if booking can be deleted (must be at least 4 hours before showtime)
    if (booking.showtime) {
      const showtime = new Date(booking.showtime.starttime);
      const currentTime = new Date();
      const timeDifference = showtime.getTime() - currentTime.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);
      
      if (hoursDifference < 4) {
        throw new Error('Booking cannot be deleted less than 4 hours before showtime');
      }
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