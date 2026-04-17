import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Film } from './films/film.entity';
import { FilmFormat } from './films/filmFormat.entity';
import { FilmsModule } from './films/film.module';


@Module({
  imports: [UsersModule, FilmsModule, TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'cinema',
      entities: [
        User, Film, FilmFormat
      ],
      synchronize: true,
    }),],  
    
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
