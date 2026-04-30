import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import type { RequestWithUser } from 'src/helper/requestWIthUser';
import { Response } from 'express';
import { UserRole } from 'src/users/user.entity';

@Injectable()
export class LayoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const res = context.switchToHttp().getResponse<Response>();

    const role = req.user?.role;
    res.locals.layout =
      role === UserRole.ADMIN
        ? 'layouts/admin'
        : role === UserRole.CUSTOMER
          ? 'layouts/user'
          : 'layouts/main';

    return next.handle();
  }
}
