// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from '@nestjs/common';

// Custom error response interface
interface IErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error: string;
  details?: any;
}

// Custom error types
export class ValidationError extends HttpException {
  constructor(message: string | string[]) {
    super({ message, error: 'Validation Error' }, HttpStatus.BAD_REQUEST);
  }
}

export class NotFoundError extends HttpException {
  constructor(message: string) {
    super({ message, error: 'Not Found' }, HttpStatus.NOT_FOUND);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Default error response
    let errorResponse: IErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };

    // Handle different types of errors
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      errorResponse = {
        ...errorResponse,
        statusCode: status,
        message: exceptionResponse.message || exception.message,
        error: exceptionResponse.error || 'Error',
      };
    } else if (exception instanceof Error) {
      // Handle generic Error instances
      errorResponse = {
        ...errorResponse,
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : exception.message,
        error: exception.name,
      };
    }

    // Log the error (with stack trace in development)
    this.logger.error(
      `${request.method} ${request.url}`,
      process.env.NODE_ENV === 'production'
        ? errorResponse
        : {
            ...errorResponse,
            stack: exception instanceof Error ? exception.stack : undefined,
          },
    );

    // Remove sensitive information in production
    if (process.env.NODE_ENV === 'production') {
      delete errorResponse.details;
      if (errorResponse.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
        errorResponse.message = 'Internal server error';
      }
    }

    httpAdapter.reply(response, errorResponse, errorResponse.statusCode);
  }
}

// src/common/interceptors/error-interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        if (error instanceof HttpException) {
          return throwError(() => error);
        }
        // Convert unknown errors to HttpException
        return throwError(
          () =>
            new HttpException(
              {
                message: 'Internal server error',
                error: 'Internal Server Error',
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}

// Usage in main.ts
import { NestFactory } from '@nestjs/core';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ErrorInterceptor } from './common/interceptors/error-interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get HTTP adapter
  const httpAdapter = app.get(HttpAdapterHost);
  
  // Apply global error filter
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  
  // Apply global error interceptor
  app.useGlobalInterceptors(new ErrorInterceptor());
  
  await app.listen(3000);
}
bootstrap();