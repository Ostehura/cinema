import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { AudithoriumService } from './audithorium.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { AudithotoriumDto } from './audithorium.dto';
import type { Response } from 'express';
import { SeansFormat } from 'src/films/filmFormat.entity';
import { AudithoriumFormatDTO } from './audithoriumFormatsDTO';

@Controller('audithorium')
export class AudithoriumController {
  constructor(private readonly audithoriumService: AudithoriumService) {}
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('audithorium/index')
  async allAudithoriumsPage() {
    const audithoriums = await this.audithoriumService.getAllAudithoriums();
    audithoriums.forEach((audithorium) => {
      audithorium.capacity_evalueted = audithorium.capacity;
    });
    return { audithoriums: audithoriums };
  }

  @Get('view/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('audithorium/view')
  async AudithoriumsPage(@Param() params: { id: number }) {
    const audithorium = await this.audithoriumService.getAudithoriumById(
      params.id,
    );
    const resp = {
      audithorium,
      formats: Object.values(SeansFormat).map((seans: SeansFormat) => {
        return {
          name: seans,
          selected:
            audithorium.supportedFormat?.findIndex(
              (element) => element.supportedFormat == seans,
            ) != -1,
        };
      }),
    };
    return resp;
  }

  @Get('new')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('audithorium/new')
  newAudithoriumPage() {
    return {};
  }

  @Post('new')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async newAudithoriumQuery(
    @Body()
    audithoriumDTO: AudithotoriumDto,
    @Res() res: Response,
  ) {
    const audithorium = await this.audithoriumService.createAudithorium(
      audithoriumDTO.name,
      audithoriumDTO.number_of_rows,
      audithoriumDTO.number_of_seats_in_row,
    );
    res.redirect(`/audithorium/view/${audithorium.id}`);
    return res;
  }

  @Post('edit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async editAudithoriumQuery(
    @Param() params: { id: number },
    @Body()
    audithoriumDTO: AudithotoriumDto,
    @Res() res: Response,
  ) {
    const audithorium = await this.audithoriumService.editAudithorium(
      params.id,
      audithoriumDTO.name,
      audithoriumDTO.number_of_rows,
      audithoriumDTO.number_of_seats_in_row,
    );
    res.redirect(`/audithorium/view/${audithorium.id}`);
    return res;
  }

  @Post('formats/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async editAurithoriumsFormats(
    @Param() params: { id: number },
    @Body()
    audithoriumDTO: AudithoriumFormatDTO,
    @Res() res: Response,
  ) {
    await this.audithoriumService.modifyAudithoriumFormats(
      params.id,
      audithoriumDTO,
    );
    res.redirect(`/audithorium/view/${params.id}`);
    return res;
  }
}
