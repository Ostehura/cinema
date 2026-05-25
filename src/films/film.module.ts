import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilmService } from './film.service';
import { FilmFormatService } from './filmFormat.service';
import { FilmController, FilmFormatController } from './film.controller';
import { Film } from './film.entity';
import { FilmFormat } from './filmFormat.entity';
import { BookingModule } from '../bookings/booking.module';



@Module({
  imports: [TypeOrmModule.forFeature([Film, FilmFormat]), BookingModule],
  controllers: [FilmController, FilmFormatController],
  providers: [FilmService, FilmFormatService],
  exports: [FilmService, FilmFormatService],
})
export class FilmsModule {}
