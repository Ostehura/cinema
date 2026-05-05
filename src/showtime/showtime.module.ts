import { Module } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { ShowtimeController } from './showtime.controller';
import { Showtime } from './showtime.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilmsModule } from 'src/films/film.module';
import { AuthModule } from 'src/auth/auth.module';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Showtime]),
    FilmsModule,
    AuthModule,
    CartModule,
  ],
  providers: [ShowtimeService],
  controllers: [ShowtimeController],
})
export class ShowtimeModule {}
