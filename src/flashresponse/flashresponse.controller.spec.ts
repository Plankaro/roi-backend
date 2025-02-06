import { Test, TestingModule } from '@nestjs/testing';
import { FlashresponseController } from './flashresponse.controller';
import { FlashresponseService } from './flashresponse.service';

describe('FlashresponseController', () => {
  let controller: FlashresponseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlashresponseController],
      providers: [FlashresponseService],
    }).compile();

    controller = module.get<FlashresponseController>(FlashresponseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
