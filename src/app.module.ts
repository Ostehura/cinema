import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LayoutInterceptor } from './auth/layout.interceptor';
import { GuestMiddleware } from './auth/guest.middleware';
import { UserMiddleware } from './middleware/user.middleware';
import { AudithoriumModule } from './audithorium/audithorium.module';
import {
  Audithorium,
  AudithoriumFormat,
} from './audithorium/audithorium.entity';
import { Film } from './films/film.entity';
import { FilmFormat } from './films/filmFormat.entity';
import { Booking } from './bookings/booking.entity';
import { Ticket } from './ticket/ticket.entity';
import { FilmsModule } from './films/film.module';
import { ShowtimeModule } from './showtime/showtime.module';
import { Showtime } from './showtime/showtime.entity';
import { BookingModule } from './bookings/booking.module';
import { CartModule } from './cart/cart.module';
import { Cart, CartItem } from './cart/cart.entity';
import { AdminModule } from './admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        User,
        Film,
        FilmFormat,
        Audithorium,
        AudithoriumFormat,
        Showtime,
        Cart,
        CartItem,
        Booking,
        Ticket,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Film,
      FilmFormat,
      Showtime,
      Audithorium,
      Booking,
      Ticket,
    ]),
    UsersModule,
    FilmsModule,
    AuthModule,
    AudithoriumModule,
    ShowtimeModule,
    CartModule,
    AdminModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LayoutInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GuestMiddleware).forRoutes('*');
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
