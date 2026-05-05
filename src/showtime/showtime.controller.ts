import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import {
  CreateShowTimeDTO,
  DeleteSHowtimeForAuditoriumDTO,
} from './showtime.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { getDateEnd, getDateStart } from './helper';
import type { Response } from 'express';

@Controller('showtime')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}
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
}
