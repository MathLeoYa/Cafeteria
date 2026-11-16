import { Controller, Get } from '@nestjs/common';
import { HealthStatus } from '@cafeteria/shared';

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'cafeteria-api',
      version: '0.1.0',
    };
  }
}
