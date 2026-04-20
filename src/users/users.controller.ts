import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
