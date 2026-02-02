import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'node:process';

function formatValidationErrors(validationErrors: ValidationError[]) {
  const errors = {};
  validationErrors.forEach((error) => {
    if (error.constraints) {
      errors[error.property] = Object.values(error.constraints);
    }
    if (error.children && error.children.length > 0) {
      errors[error.property] = formatValidationErrors(error.children);
    }
  });

  return errors;
}

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Rodinya Case')
    .setDescription('API Endpoints')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token **_only_**',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: '/swagger.json',
    swaggerOptions: {
      docExpansion: 'none',
    },
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = formatValidationErrors(validationErrors);
        return new BadRequestException({
          message: errors,
          error: 'Bad Request',
          statusCode: 400,
        });
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  setupSwagger(app);
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap().then(() => console.log('Server started'));
