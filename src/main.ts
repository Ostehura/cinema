import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';
import { DatabaseSeeder } from './seeds/database.seed';
import { Connection } from 'typeorm';



async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const helpers = require('handlebars-helpers')();

  app.setViewEngine('hbs');

  

  app.use(cookieParser());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..',  'views'));
  app.set('view options', { layout: 'layouts/main' });
  app.setViewEngine('hbs');

  // Register Handlebars helpers
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
  hbs.handlebars.registerHelper('eq', (a, b) => {
    return a === b;
  });

  hbs.handlebars.registerHelper('or', (a, b) => {
    return a || b;
  });
  hbs.handlebars.registerHelper('and', (a, b) => {
    return a && b;
  });
  hbs.handlebars.registerHelper('add', (a, b) => {
    return a + b;
  });


  // Run database seeder
  const connection = app.get(Connection);
  const seeder = app.get(DatabaseSeeder);
  await seeder.seed();

  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();