// request-logging.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = request;
    const requestId = uuidv4();
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Attach request ID to the request object for further use
    request['requestId'] = requestId;

    // Log the incoming request
    this.logger.log(
      `[${requestId}] Incoming ${method} ${originalUrl} from ${ip} - ${userAgent}`
    );

    // Log request body in development
    if (process.env.NODE_ENV === 'development' && Object.keys(request.body || {}).length) {
      this.logger.debug(`[${requestId}] Request body: ${JSON.stringify(request.body)}`);
    }

    // Handle response logging
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const duration = Date.now() - startTime;

      // Choose log level based on status code
      if (statusCode >= 500) {
        this.logger.error(
          `[${requestId}] ${method} ${originalUrl} ${statusCode} ${contentLength}b ${duration}ms`
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `[${requestId}] ${method} ${originalUrl} ${statusCode} ${contentLength}b ${duration}ms`
        );
      } else {
        this.logger.log(
          `[${requestId}] ${method} ${originalUrl} ${statusCode} ${contentLength}b ${duration}ms`
        );
      }
    });

    // Handle response error logging
    response.on('error', (error) => {
      this.logger.error(
        `[${requestId}] ${method} ${originalUrl} - Error: ${error.message}`,
        error.stack
      );
    });

    next();
  }
}

// app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RequestLoggingMiddleware } from './middleware/request-logging.middleware';

@Module({
  // ... other module configurations
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware)
      .forRoutes('*');
  }
}

// logging.config.ts
export const loggingConfig = {
  development: {
    level: 'debug',
    prettyPrint: true,
  },
  production: {
    level: 'info',
    prettyPrint: false,
  },
  test: {
    level: 'warn',
    prettyPrint: false,
  },
};

// types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}