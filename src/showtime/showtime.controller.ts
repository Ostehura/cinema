import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
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

@Controller('showtime')
export class ShowtimeController {
  constructor(
    private readonly showtimeService: ShowtimeService,
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
    const yesterday = new Date();
    yesterday.setDate(date.getDate() - 1);
    const tommorow = new Date();
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
            req.user?.id ?? null,
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
            req.user?.id ?? null,
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
}
