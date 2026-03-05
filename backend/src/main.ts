import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import { ZodValidationPipe } from '@/pipes/zod.validation.pipe';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { RateLimiterGuard } from './guards/rate-limiter.guard';
import { PrismaService } from './services/prisma.service';
import { WebsocketAdapter } from './adapters/websocket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  // Enable shutdown hooks
  app.enableShutdownHooks();
  prismaService.enableShutdownHooks(app);

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
    new ZodValidationPipe(),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new TimeoutInterceptor(),
    new TransformInterceptor(),
  );

  // Guards
  app.useGlobalGuards(new RateLimiterGuard());

  // Middleware
  app.use(helmet());
  app.use(compression());
  app.use(morgan('combined'));

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', '').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // WebSocket
  app.useWebSocketAdapter(new WebsocketAdapter(app));

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('AgriTech API')
    .setDescription('API documentation for AgriTech platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start server
  const port = configService.get('PORT', 3000);
  await app.listen(port);

  // Graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach(signal => {
    process.on(signal, async () => {
      await app.close();
      process.exit(0);
    });
  });
}

bootstrap().catch(err => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});