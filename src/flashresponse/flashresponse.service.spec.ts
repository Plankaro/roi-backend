import { Test, TestingModule } from '@nestjs/testing';
import { FlashresponseService } from './flashresponse.service';

describe('FlashresponseService', () => {
  let service: FlashresponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlashresponseService],
    }).compile();

    service = module.get<FlashresponseService>(FlashresponseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
