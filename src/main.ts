import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  //apply middleware globally
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.enableCors({
    origin: [
      'http://localhost',
      'http://localhost:80',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1',
      'http://127.0.0.1:80',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  });

  const swagger = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('This is a sample NestJS API')
    .addServer('http://localhost:3000')
    .setTermsOfService('http://localhost:3000/terms')
    .setLicense('MIT', 'http://localhost:3000/license')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('swagger', app, documentation);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
