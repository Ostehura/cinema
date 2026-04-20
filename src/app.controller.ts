import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { OptionalJwtAuthGuard } from './auth/optionalauth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  @UseGuards(OptionalJwtAuthGuard)
  getHello(): any {
    return {};
  }
}
