import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { OptionalJwtAuthGuard } from './auth/optionalauth.guard';
import { FilmService } from './films/film.service';
import { Film } from './films/film.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly filmService: FilmService,
  ) {}

  @Get()
  @Render('index')
  @UseGuards(OptionalJwtAuthGuard)
  async getHello(): Promise<{ films: Film[], activePage:string }> {
    return {
      films: await this.filmService.findAllFilmsWithSeansByWeek(new Date()),
     activePage: '/' };
  }
}
