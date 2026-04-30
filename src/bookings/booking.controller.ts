import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Delete,
  Request
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking } from './booking.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import type { RequestWithUser } from 'src/helper/requestWIthUser'; 

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
  @Roles(UserRole.ADMIN,)
  async getBookingsByUser(@Param('userId') userId: string): Promise<Booking[]> {
    return this.bookingService.findByUserId(userId);
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
      seansID: string;
      amount: number;
      amountReduced: number;
      dateTime: string;
      userID?: string;
      guestEmail?: string;
    },
  ): Promise<Booking> {
    return this.bookingService.create(
      body.seansID,
      body.amount,
      body.amountReduced,
      new Date(body.dateTime),
      body.userID,
      body.guestEmail,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  
  async deleteBooking(@Param('id') id: string, @Request() req: RequestWithUser): Promise<{ message: string }> {
    const booking = await this.bookingService.findById(id);
    if (req.user.role == UserRole.ADMIN){
      await this.bookingService.delete(id);
    }
    else if (req.user.role == UserRole.CUSTOMER && booking.userId == req.user.id && booking.datetime){ // 
      await this.bookingService.delete(id);
    }
      
    return { message: 'Booking deleted successfully' };
  }
}
