import { Module, forwardRef } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { ShowtimeController } from './showtime.controller';
import { Showtime } from './showtime.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CartModule } from 'src/cart/cart.module';
import { BookingModule } from 'src/bookings/booking.module';
import { FilmsModule } from 'src/films/film.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Showtime]),
    BookingModule,
    AuthModule,
    CartModule,
    FilmsModule,
  ],
  providers: [ShowtimeService],
  controllers: [ShowtimeController],
  exports: [ShowtimeService]
})
export class ShowtimeModule {}
