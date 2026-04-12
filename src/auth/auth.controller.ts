import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { OptionalJwtAuthGuard } from './optionalauth.guard';
import { User } from 'src/users/user.entity';
import type { RequestWithUser } from 'src/helper/requestWIthUser';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  @Render('login')
  async logInPage() {}
  @Get('signup')
  @Render('register')
  async signUpPage() {}

  @UseGuards(OptionalJwtAuthGuard)
  @Redirect('/')
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.signIn(
      email,
      password,
    );

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { message: 'Logged in' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser): User {
    if (!req.user) {
      throw new UnauthorizedException('User have no access to page!');
    }
    return req.user;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('register')
  async register(
    @Body()
    registerDto: {
      email: string;
      password: string;
      confirmPassword: string;
      firstname: string;
      lastname: string;
    },
  ) {
    await this.authService.createProfile(
      registerDto.email,
      registerDto.firstname,
      registerDto.lastname,
      registerDto.password,
      registerDto.confirmPassword,
    );
    return true;
  }
}
