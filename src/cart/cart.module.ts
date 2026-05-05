import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart, CartItem } from './cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [CartService],
  controllers: [CartController],
  imports: [TypeOrmModule.forFeature([Cart, CartItem])],
  exports: [CartService],
})
export class CartModule {}
