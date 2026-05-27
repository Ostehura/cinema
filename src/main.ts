import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';
import { AllExceptionsFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setViewEngine('hbs');

  app.use(cookieParser());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.set('view options', { layout: 'layouts/main' });
  app.setViewEngine('hbs');
  app.useGlobalFilters(new AllExceptionsFilter());

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

  hbs.handlebars.registerHelper('formatDate', function (date: string) {
    const d= new Date(date);

    return d.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  });



  hbs.handlebars.registerHelper('formatHour', function (date: string) {
    const d = new Date(date);

    return d.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  });
  // hbs.handlebars.registerHelper('in', (lhs: any[], rhs) => {
  //   return lhs.includes(rhs);
  // });
  hbs.handlebars.registerHelper('eq', (a, b) => {
    return a === b;
  });

  hbs.handlebars.registerHelper('or', (a, b) => {
    return Boolean(a) || Boolean(b);
  });
  hbs.handlebars.registerHelper('and', (a, b) => {
    return Boolean(a) && Boolean(b);
  });
  hbs.handlebars.registerHelper('add', (a, b) => {
    return Number(a) + Number(b);
  });

  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
