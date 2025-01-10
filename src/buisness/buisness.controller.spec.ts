import { Test, TestingModule } from '@nestjs/testing';
import { BuisnessController } from './buisness.controller';
import { BuisnessService } from './buisness.service';

describe('BuisnessController', () => {
  let controller: BuisnessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuisnessController],
      providers: [BuisnessService],
    }).compile();

    controller = module.get<BuisnessController>(BuisnessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
