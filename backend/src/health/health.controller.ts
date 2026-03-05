// src/health/types/health.types.ts
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentUsed: number;
  };
  database: {
    status: 'connected' | 'disconnected';
    responseTime: number;
  };
}

// src/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthCheckResult } from './types/health.types';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async checkHealth(): Promise<HealthCheckResult> {
    const [dbStatus, dbResponseTime] = await this.checkDatabase();
    const memoryUsage = this.checkMemory();
    const uptime = process.uptime();

    const isHealthy = dbStatus === 'connected' && memoryUsage.percentUsed < 90;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime,
      memory: memoryUsage,
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
    };
  }

  private async checkDatabase(): Promise<['connected' | 'disconnected', number]> {
    const startTime = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;
      return ['connected', responseTime];
    } catch (error) {
      return ['disconnected', 0];
    }
  }

  private checkMemory() {
    const used = process.memoryUsage().heapUsed;
    const total = process.memoryUsage().heapTotal;
    const percentUsed = (used / total) * 100;

    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentUsed: Math.round(percentUsed * 100) / 100,
    };
  }
}

// src/health/health.controller.ts
import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthCheckResult } from './types/health.types';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async checkHealth(): Promise<HealthCheckResult> {
    const health = await this.healthService.checkHealth();
    
    if (health.status === 'unhealthy') {
      throw new HttpException(health, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return health;
  }
}

// src/health/health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}