import { Request } from 'express';
import { UserRole } from 'src/users/user.entity';

export class UserPayload {
  userId!: string;
  email!: string;
  role!: UserRole;
}
export interface RequestWithUser extends Request {
  user?: UserPayload;
}
