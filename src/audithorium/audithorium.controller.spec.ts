import { Test, TestingModule } from '@nestjs/testing';
import { AudithoriumController } from './audithorium.controller';

describe('AudithoriumController', () => {
  let controller: AudithoriumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudithoriumController],
    }).compile();

    controller = module.get<AudithoriumController>(AudithoriumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
