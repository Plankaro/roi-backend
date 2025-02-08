import { Test, TestingModule } from '@nestjs/testing';
import { GoController } from './go.controller';
import { GoService } from './go.service';

describe('GoController', () => {
  let controller: GoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoController],
      providers: [GoService],
    }).compile();

    controller = module.get<GoController>(GoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
