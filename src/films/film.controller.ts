import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { FilmService } from './film.service';
import { Film } from './film.entity';

@Controller('film')
export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  @Get(':id')
  async getFilmById(@Param('id') id: string): Promise<Film> {
    const film = await this.filmService.findById(id);
    if (!film) {
      throw new NotFoundException(`Film with ID ${id} not found`);
    }
    return film;
  }
}