import { Controller, Get, Render } from '@nestjs/common';
import { AudithoriumService } from 'src/audithorium/audithorium.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly audithoriumService: AudithoriumService) {}
  @Get()
  @Render('admin')
  async adminPage() {
    const audithoriums = await this.audithoriumService.getAllAudithoriums();
    return { audithoriums: audithoriums, date: new Date() };
  }
}
