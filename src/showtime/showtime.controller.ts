import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Render,
} from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { CreateShowTimeDTO } from './showtime.dto';

@Controller('showtime')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}
  @Get('new')
  @Render('showtime/new')
  getNewPage() {
    return '';
  }

  @Get('audithorium/:id')
  async getAudithoriums(@Param() params: { id: string }) {
    return await this.showtimeService.getAvaiableAudithorium(params.id);
  }

  @Get('shows')
  async getShowsByAudithorium(
    @Query('audithorium') auditoriumId: number,
    @Query('date') date: Date,
  ) {
    return await this.showtimeService.getShowsByAudithorium(date, auditoriumId);
  }

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
    );
  }
}
