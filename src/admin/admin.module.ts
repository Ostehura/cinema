import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AudithoriumModule } from 'src/audithorium/audithorium.module';

@Module({
  controllers: [AdminController],
  imports: [AudithoriumModule],
})
export class AdminModule {}
