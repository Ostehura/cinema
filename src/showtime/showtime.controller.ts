import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Redirect,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import {
  CreateShowTimeDTO,
  DeleteSHowtimeForAuditoriumDTO,
  ShowTimeDTO,
} from './showtime.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { getDateEnd, getDateStart } from './helper';
import type { Response } from 'express';
import { CartService } from 'src/cart/cart.service';
import type { RequestWithUser } from 'src/helper/requestWIthUser';
import { OptionalJwtAuthGuard } from 'src/auth/optionalauth.guard';
import { FilmService } from 'src/films/film.service';

@Controller('showtime')
export class ShowtimeController {
  constructor(
    private readonly showtimeService: ShowtimeService,
    private readonly filmService: FilmService,
    private cartServise: CartService,
  ) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('new')
  @Render('showtime/new')
  getNewPage() {
    return '';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('searchaudithorium/:id')
  async getAudithoriums(@Param() params: { id: string }) {
    return await this.showtimeService.getAvaiableAudithorium(params.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('shows')
  async getShowsByAudithorium(
    @Query('audithorium') auditoriumId: number,
    @Query('date') date: Date,
  ) {
    return await this.showtimeService.getShowsByAudithorium(date, auditoriumId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('new')
  @Redirect('/showtime/new')
  async createShowtime(
    @Body()
    showtimeDTO: CreateShowTimeDTO,
  ) {
    return await this.showtimeService.addShowtime(
      showtimeDTO.filmId,
      showtimeDTO.format,
      showtimeDTO.audithoriumId,
      new Date(showtimeDTO.starttime),
      showtimeDTO.price,
      showtimeDTO.language,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('audithorium/:id')
  @Render('showtime/audithoriumView')
  async getAudithoriumView(
    @Query('date') date: Date,
    @Param('id') audithoriumId: number,
  ) {
    date = new Date(date);
    const yesterday = new Date(date);
    yesterday.setDate(date.getDate() - 1);
    const tommorow = new Date(date);
    tommorow.setDate(date.getDate() + 1);
    return {
      list: JSON.stringify(
        await this.showtimeService.getShowtimePerAudithoriumAndDay(
          audithoriumId,
          date,
        ),
      ),
      audithoriumId: audithoriumId,
      date: date,
      yesterday: yesterday.toDateString(),
      tommorow: tommorow.toDateString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('/audithorium/delete')
  async deleteShowtimesForAudithoriumAndDate(
    @Body() audithorium: DeleteSHowtimeForAuditoriumDTO,
    @Res() res: Response,
  ) {
    await this.showtimeService.deleteShowtimeForAudithorium(
      audithorium.audithoriumId,
      getDateStart(audithorium.day),
      getDateEnd(audithorium.day),
    );
    return res.redirect(
      `/showtime/audithorium/${audithorium.audithoriumId}?date=${audithorium.day.toDateString()}`,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('show/:id')
  @Render('showtime/show')
  async getShow(
    @Param('id') showId: number,
    @Req() req: RequestWithUser,
  ): Promise<ShowTimeDTO> {
    const show = await this.showtimeService.getShowtimeId(showId);
    if (
      !show.audithorium ||
      !show.filmFormat ||
      !show.filmFormat.film ||
      show.filmFormat === undefined
    ) {
      throw new InternalServerErrorException('Something went wromng');
    }
    const showView: ShowTimeDTO = {
      id: show.id,
      filmFormatId: show.filmFormatId,
      audithoriumId: show.audithoriumId,
      price: show.price,
      audithorium: show.audithorium,
      endtime: show.endtime,
      filmFormat: show.filmFormat,
      starttime: show.starttime,
      takenSeats: JSON.stringify(
        (
          await this.cartServise.getNotMyTickets(
            req.user?.userId ?? null,
            req.cookies.guest_id,
            showId,
          )
        )?.map((item) => {
          return { column: item.column, row: item.row };
        }),
      ),
      yourSeats: JSON.stringify(
        (
          await this.cartServise.getMyTickets(
            req.user?.userId ?? null,
            req.cookies.guest_id,
            showId,
          )
        )?.map((item) => {
          return { column: item.column, row: item.row };
        }),
      ),
    };
    return showView;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('show/:id/delete')
  async deleteShow(@Param('id') showId: number, @Res() res: Response) {
    const show = await this.showtimeService.deleteShowtime(showId);
    res.redirect(
      `/showtime/audithorium/${show.audithoriumId}?date=${show.starttime.toDateString()}`,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Render('showtime/allShowtimePage')
  @Get()
  async getShowPage(@Query('date') rowDate?: string) {
    let date;
    if (rowDate) {
      date = new Date(rowDate);
    } else {
      date = new Date();
    }
    const weekDates: { title: string; url: string }[] = [];
    for (let i = 0; i <= 7; i++) {
      const day = new Date();
      day.setDate(day.getDate() + i);
      weekDates.push({
        title: day.toLocaleDateString('pl-PL', {
          day: '2-digit',
          month: '2-digit',
        }),
        url: day.toDateString(),
      });
    }
    return {
      days: weekDates,
      films: await this.filmService.findAllFilmsWithSeansByDay(date),
    };
  }
}
