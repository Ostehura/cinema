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
import { AudithoriumModule } from './audithorium/audithorium.module';
import {
  Audithorium,
  AudithoriumFormat,
} from './audithorium/audithorium.entity';
import { Film } from './films/film.entity';
import { FilmFormat } from './films/filmFormat.entity';
import { FilmsModule } from './films/film.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'cinema',
      entities: [User, Film, FilmFormat, Audithorium, AudithoriumFormat],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    AudithoriumModule,
    FilmsModule,
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
  }
}
