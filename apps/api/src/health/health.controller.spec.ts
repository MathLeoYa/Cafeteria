import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe('GET /health', () => {
    it('should return health status with status "ok"', () => {
      const result = healthController.check();
      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('cafeteria-api');
      expect(result.version).toBe('0.1.0');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
