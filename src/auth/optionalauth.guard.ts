// optional-jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest so it doesn't throw an error
  handleRequest<TUser = any>(err: any, user: any): TUser {
    // If there's an error or no user, just return null
    // instead of throwing UnauthorizedException
    if (err || !user) {
      return null as TUser;
    }
    return user as TUser;
  }
}
