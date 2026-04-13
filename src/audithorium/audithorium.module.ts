import { Module } from '@nestjs/common';
import { AudithoriumController } from './audithorium.controller';
import { AudithoriumService } from './audithorium.service';
import { Audithorium } from './audithorium.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Audithorium]), AuthModule],
  controllers: [AudithoriumController],
  providers: [AudithoriumService],
})
export class AudithoriumModule {}
