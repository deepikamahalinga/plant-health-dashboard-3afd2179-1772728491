import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { HealthCheckError } from '@nestjs/terminus';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
          ]
        : undefined,
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Connection pooling configuration
      connectionLimit: 20,
      poolTimeout: 30,
    });

    // Query logging in development
    if (process.env.NODE_ENV === 'development') {
      this.$on<any>('query', (e: Prisma.QueryEvent) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });

      this.$on<any>('error', (e: Prisma.LogEvent) => {
        this.logger.error(`Database error: ${e.message}`);
      });
    }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Health check method for the database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      throw new HealthCheckError(
        'Database health check failed',
        error
      );
    }
  }

  /**
   * Helper method for database transactions
   */
  async executeTransaction<T>(
    fn: (prisma: Prisma.TransactionClient) => Promise<T>,
    options?: Prisma.TransactionOptions
  ): Promise<T> {
    try {
      return await this.$transaction(fn, {
        maxWait: 5000, // maximum time to wait for transaction to start
        timeout: 10000, // maximum time for entire transaction
        ...options,
      });
    } catch (error) {
      this.logger.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Middleware for query soft deletion
   */
  async enableSoftDelete() {
    this.$use(async (params, next) => {
      if (params.action === 'delete') {
        params.action = 'update';
        params.args['data'] = { deletedAt: new Date() };
      }
      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        if (params.args.data !== undefined) {
          params.args.data['deletedAt'] = new Date();
        } else {
          params.args['data'] = { deletedAt: new Date() };
        }
      }
      return next(params);
    });
  }

  /**
   * Helper method to safely close the connection
   */
  async safeDisconnect(): Promise<void> {
    try {
      await this.$disconnect();
    } catch (error) {
      this.logger.error('Error during safe disconnect:', error);
      // Force disconnect after timeout
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }

  /**
   * Method to clear query cache if needed
   */
  async clearQueryCache(): Promise<void> {
    try {
      await this.$queryRaw`DISCARD ALL`;
    } catch (error) {
      this.logger.error('Failed to clear query cache:', error);
      throw error;
    }
  }
}