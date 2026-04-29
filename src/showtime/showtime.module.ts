import { Module } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { ShowtimeController } from './showtime.controller';
import { Showtime } from './showtime.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilmsModule } from 'src/films/film.module';

@Module({
  imports: [TypeOrmModule.forFeature([Showtime]), FilmsModule],
  providers: [ShowtimeService],
  controllers: [ShowtimeController],
})
export class ShowtimeModule {}
