import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Make user available to all views
    if (req.user) {
      res.locals.user = req.user;
    }
    next();
  }
}
