import { Test, TestingModule } from '@nestjs/testing';
import { AudithoriumService } from './audithorium.service';

describe('AudithoriumService', () => {
  let service: AudithoriumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudithoriumService],
    }).compile();

    service = module.get<AudithoriumService>(AudithoriumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
