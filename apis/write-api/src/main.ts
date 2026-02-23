import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import {
  ValidationPipe,
  VersioningType,
  RequestMethod
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {GlobalExceptionFilter} from "./utils/exceptions/all-exceptions.filter";
import { useContainer } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import {TransformInterceptor} from "./utils/interceptors/transform.interceptor";
import { initializeTransactionalContext } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({
        genReqId: () => uuidv4(),
      }),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
      .setTitle('Minha API NestJS')
      .setDescription('Documentação técnica da API de Usuários')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}/v1`);
  console.log(`📄 Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();