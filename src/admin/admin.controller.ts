import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { AudithoriumService } from 'src/audithorium/audithorium.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/user.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly audithoriumService: AudithoriumService) {}
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Render('admin')
  async adminPage() {
    const audithoriums = await this.audithoriumService.getAllAudithoriums();
    return { audithoriums: audithoriums, date: new Date() };
  }
}
