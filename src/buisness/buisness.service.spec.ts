import { Test, TestingModule } from '@nestjs/testing';
import { BuisnessService } from './buisness.service';

describe('BuisnessService', () => {
  let service: BuisnessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuisnessService],
    }).compile();

    service = module.get<BuisnessService>(BuisnessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
