import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Render,
  Redirect,
  Query,
} from '@nestjs/common';
import { FilmService } from './film.service';
import { FilmFormatService } from './filmFormat.service';
import { SeansFormat } from './filmFormat.entity';

import { UserRole } from '../users/user.entity';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { OptionalJwtAuthGuard } from 'src/auth/optionalauth.guard';

@Controller('film')
export class FilmController {
  constructor(
    private readonly filmService: FilmService,
    private readonly filmFormatService: FilmFormatService,
  ) {}
  @Get('search')
  async getFilmByName(@Query('q') query: string) {
    return await this.filmService.searchFilmsByName(query);
  }

   @Get()
   @UseGuards(OptionalJwtAuthGuard)
   @Render('films/index')
   async listFilms() {
     const films = await this.filmService.findAll();
     return { films, activePage: '/film' };
   }

  @Get('view/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @Render('films/view')
  async viewFilm(@Param('id') id: string) {
    const film = await this.filmService.findById(id);
    const formats = await this.filmFormatService.findByFilmId(id);
    return { film, formats, backUrl: '/film' };
  }

  @Get('new')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('films/new')
  newFilmForm() {
    return {
      film: null,
      formats: Object.values(SeansFormat),
      backUrl: '/film',
    };
  }

  @Post('new')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Redirect('/film')
  async createFilm(
    @Body()
    body: {
      title: string;
      director: string;
      duration: number;
      description: string;
    },
  ) {
    const film = await this.filmService.addFilm(
      body.title,
      body.director,
      body.duration,
      body.description,
    );
    return { url: `/film/view/${film.id}` };
  }

  @Get('edit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('films/edit')
  async editFilmForm(@Param('id') id: string) {
    const film = await this.filmService.findById(id);
    const formats = await this.filmFormatService.findByFilmId(id);
    return {
      film,
      formats,
      formatTypes: Object.values(SeansFormat),
      backUrl: `/film/view/${id}`,
    };
  }

  @Post('edit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Redirect('/film')
  async updateFilm(
    @Param('id') id: string,
    @Body()
    body: {
      title: string;
      director: string;
      duration: number;
      description: string;
    },
  ) {
    await this.filmService.updateFilm(id, body);
    return { url: `/film/view/${id}` };
  }

  @Post('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Redirect('/film')
  async deleteFilm(@Param('id') id: string) {
    await this.filmService.deleteFilm(id);
    return { url: '/film' };
  }

  @Post('edit/:id/format')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Redirect('back')
  async addFormat(
    @Param('id') id: string,
    @Body() body: { seansFormat: SeansFormat; dubbing: string },
  ) {
    await this.filmFormatService.create(id, body.seansFormat, body.dubbing);
    return { url: `/film/edit/${id}` };
  }

  @Post('edit/:id/format/:formatId/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Redirect('back')
  async deleteFormat(
    @Param('id') id: string,
    @Param('formatId') formatId: string,
  ) {
    await this.filmFormatService.delete(formatId);
    return { url: `/film/edit/${id}` };
  }

  @Post('edit/:id/format/:formatId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Redirect('back')
  async updateFormat(
    @Param('id') id: string,
    @Param('formatId') formatId: string,
    @Body() body: { seansFormat: SeansFormat; dubbing: string },
  ) {
    await this.filmFormatService.update(formatId, {
      seansFormat: body.seansFormat,
      dubbing: body.dubbing,
    });
    return { url: `/film/edit/${id}` };
  }
}

@Controller('filmformat')
export class FilmFormatController {
  constructor(private readonly filmFormatService: FilmFormatService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('filmformats/index')
  async listFormats() {
    const formats = await this.filmFormatService.findAll();
    return { formats, formatTypes: Object.values(SeansFormat) };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Redirect('/filmformat')
  async createFormat(
    @Body() body: { filmID: string; seansFormat: SeansFormat; dubbing: string },
  ) {
    await this.filmFormatService.create(
      body.filmID,
      body.seansFormat,
      body.dubbing,
    );
    return { url: '/filmformat' };
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Redirect('/filmformat')
  async updateFormat(
    @Param('id') id: string,
    @Body() body: { seansFormat: SeansFormat; dubbing: string },
  ) {
    await this.filmFormatService.update(id, body);
    return { url: '/filmformat' };
  }

  @Post(':id/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Redirect('/filmformat')
  async deleteFormat(@Param('id') id: string) {
    await this.filmFormatService.delete(id);
    return { url: '/filmformat' };
  }
}
