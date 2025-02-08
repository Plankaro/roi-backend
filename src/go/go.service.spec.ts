import { Test, TestingModule } from '@nestjs/testing';
import { GoService } from './go.service';

describe('GoService', () => {
  let service: GoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoService],
    }).compile();

    service = module.get<GoService>(GoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
