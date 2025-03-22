import { Test, TestingModule } from '@nestjs/testing';
import { GemniService } from './gemni.service';

describe('GemniService', () => {
  let service: GemniService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GemniService],
    }).compile();

    service = module.get<GemniService>(GemniService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
