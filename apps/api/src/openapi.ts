import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const OPENAPI_PATH = 'docs';

export const setupOpenApi = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('Namu: agendamento de sessões')
    .setDescription(
      'Agendamento de sessões com especialistas de bem-estar. Horários gravados em UTC e ' +
        'exibidos no fuso de São Paulo; erros no formato { statusCode, code, message, details? }.',
    )
    .setVersion('1.0')
    .build();
  SwaggerModule.setup(OPENAPI_PATH, app, () => SwaggerModule.createDocument(app, config));
};
