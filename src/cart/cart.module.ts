import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart, CartItem } from './cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingModule } from 'src/bookings/booking.module';
import { TicketModule } from 'src/ticket/ticket.module';

@Module({
  providers: [CartService],
  controllers: [CartController],
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), BookingModule, TicketModule],
  exports: [CartService],
})
export class CartModule {}
