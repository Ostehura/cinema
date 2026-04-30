import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.set('view options', { layout: 'layouts/main' });
  app.setViewEngine('hbs');
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
  });
  await app.listen(process.env.PORT ?? 3000);
  hbs.handlebars.registerHelper('range', (start: number, end: number) => {
    const arr: number[] = [];
    for (let i = start; i <= end; i++) {
      arr.push(i);
    }
    return arr;
  });
  hbs.handlebars.registerHelper('toChar', (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C...
  });
  hbs.handlebars.registerHelper('isMiddle', (seatIndex, total) => {
    return seatIndex === Math.floor(total / 2);
  });
}
bootstrap();
