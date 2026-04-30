import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenPair } from './helpers';
import { UserService } from 'src/users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<TokenPair> {
    const user = await this.usersService.findByEmail(email, true);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const tokens = {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
      }),
    };
    return tokens;
  }

  async createProfile(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    confirmPassword: string,
  ) {
    if (password !== confirmPassword) {
      throw new HttpException(
        'Password does not match',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser(
      email,
      firstName,
      lastName,
      hashedPassword,
    );

    return user;
  }
}
