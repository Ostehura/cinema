import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { CreateShowTimeDTO } from './showtime.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { Roles } from 'src/auth/roles.decorator';

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
  @Get('audithorium/:id')
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
    );
  }
}
