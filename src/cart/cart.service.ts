import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Not, Repository } from 'typeorm';
import { Cart, CartItem } from './cart.entity';
import { CartDto, CartUpdateDto } from './cart.dto';
import { addMinutes } from 'src/helper/time';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CartService {
  @InjectRepository(Cart)
  private readonly cartRepository!: Repository<Cart>;
  @InjectRepository(CartItem)
  private readonly cartItemRepository!: Repository<CartItem>;
  async findOrCreateUserCart(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        cartItems: true,
      },
    });
    if (!cart) {
      const newCart = this.cartRepository.create({ user: { id: userId } });
      await this.cartRepository.save(newCart);
      cart = await this.cartRepository.findOne({
        where: { user: { id: userId } },
        relations: {
          cartItems: true,
        },
      });
    }
    if (!cart) {
      throw new InternalServerErrorException('Can not find a cart');
    }
    return cart;
  }

  async findOrCreateGuestCart(guestId: string) {
    let cart = await this.cartRepository.findOne({
      where: { guestId },
      relations: {
        cartItems: true,
      },
    });
    if (!cart) {
      const newCart = this.cartRepository.create({ guestId });
      await this.cartRepository.save(newCart);
      cart = await this.cartRepository.findOne({
        where: { guestId },
        relations: {
          cartItems: true,
        },
      });
    }
    if (!cart) {
      throw new InternalServerErrorException('Can not find a cart');
    }
    return cart;
  }
  async addProductToCart(
    userId: string | null,
    guestId: string | null,
    product: CartDto,
  ) {
    let cart: Cart;
    if (userId) {
      cart = await this.findOrCreateUserCart(userId);
    } else if (guestId) {
      cart = await this.findOrCreateGuestCart(guestId);
    } else {
      throw new UnauthorizedException();
    }

    const inCart = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        seansId: product.seansId,
        column: product.column,
        row: product.row,
      },
    });
    if (inCart) {
      await this.cartItemRepository.delete(inCart);
      return;
    }
    const reserved = await this.cartItemRepository.findOne({
      where: {
        seansId: product.seansId,
        column: product.column,
        row: product.row,
      },
    });
    if (reserved) {
      return;
    }
    const item = this.cartItemRepository.create({
      cartId: cart.id,
      seansId: product.seansId,
      column: product.column,
      row: product.row,
    });
    await this.cartItemRepository.insert(item);
    await this.cartRepository.update(
      { id: cart.id },
      { expirationTime: addMinutes(new Date(), 20) },
    );
    return item;
  }

  async getCart(userId: string | null, guestId: string | null) {
    if (userId) {
      return await this.cartRepository.findOne({
        where: { user: { id: userId } },
        relations: {
          cartItems: { showtime: { filmFormat: { film: true } } },
        },
      });
    } else if (guestId) {
      return await this.cartRepository.findOne({
        where: { guestId },
        relations: {
          cartItems: { showtime: { filmFormat: { film: true } } },
        },
      });
    } else {
      throw new UnauthorizedException();
    }
  }

  async mergeGuestCartIntoUser(guestId: string, userId: string) {
    const guestCart = await this.findOrCreateGuestCart(guestId);
    if (!guestCart) return;

    const userCart = await this.findOrCreateUserCart(userId);
    // merge items
    if (!guestCart.cartItems || !guestCart.guestId) {
      return;
    }
    for (const item of guestCart.cartItems) {
      await this.cartItemRepository.update(
        { seansId: item.seansId, row: item.row, column: item.column },
        { cartId: userCart.id },
      );
    }
    await this.cartRepository.update(
      { id: userCart.id },
      { expirationTime: guestCart.expirationTime },
    );
    await this.deleteGuestCart(guestCart.guestId);
  }
  async addOrUpdateItem(cartId: number, product: CartDto) {
    const productAlreadyInCart = await this.cartItemRepository.findOne({
      where: {
        column: product.column,
        row: product.row,
        seansId: product.seansId,
      },
    });
    if (productAlreadyInCart) {
      throw new BadRequestException('Seat already taken');
    }
    const cartItem = this.cartItemRepository.create({
      cartId: cartId,
      column: product.column,
      row: product.row,
      seansId: product.seansId,
    });
    await this.cartItemRepository.insert(cartItem);
    return true;
  }

  async deleteCart(
    userId: string | null,
    guest_id: string | null,
    product: CartDto,
  ) {
    let cart: Cart;
    if (userId) {
      cart = await this.findOrCreateUserCart(userId);
    } else if (guest_id) {
      cart = await this.findOrCreateGuestCart(guest_id);
    } else {
      throw new UnauthorizedException();
    }
    await this.cartItemRepository.delete({
      column: product.column,
      row: product.row,
      seansId: product.seansId,
      cartId: cart.id,
    });
    return true;
  }

  async deleteGuestCart(guest_id: string) {
    const cart = await this.findOrCreateGuestCart(guest_id);
    await this.cartRepository.delete({ id: cart.id });
  }

  async updateItem(
    userId: string | null,
    guest_id: string | null,
    product: CartUpdateDto,
  ) {
    let cart: Cart;
    if (userId) {
      cart = await this.findOrCreateUserCart(userId);
    } else if (guest_id) {
      cart = await this.findOrCreateGuestCart(guest_id);
    } else {
      throw new UnauthorizedException();
    }
    await this.cartItemRepository.update(
      {
        cartId: cart.id,
        column: product.column,
        row: product.row,
        seansId: product.seansId,
      },
      { ticketType: product.ticketType },
    );
    return true;
  }

  async getMyTickets(
    userId: string | null,
    guestId: string | null,
    seansId: number,
  ) {
    if (userId) {
      const seats = await this.cartItemRepository.find({
        where: { cart: { user: { id: userId } }, seansId: seansId },
      });
      if (!seats) {
        throw new NotFoundException('Not found your tickets');
      }
      return seats;
    } else if (guestId) {
      const seats = await this.cartItemRepository.find({
        where: { cart: { guestId }, seansId: seansId },
      });
      if (!seats) {
        throw new NotFoundException('Not found your tickets');
      }
      return seats;
    }
    return [] as CartItem[];
  }

  async getNotMyTickets(
    userId: string | null,
    guestId: string | null,
    seansId: number,
  ) {
    if (userId) {
      const seats = await this.cartItemRepository.find({
        where: [
          { cart: { user: { id: Not(userId) } }, seansId: seansId },
          { cart: { user: IsNull() }, seansId: seansId },
        ],
      });
      if (!seats) {
        throw new NotFoundException('Not found your tickets');
      }
      return seats;
    } else if (guestId) {
      const seats = await this.cartItemRepository.find({
        where: [
          { cart: { guestId: IsNull() }, seansId: seansId },
          { cart: { guestId: Not(guestId) }, seansId: seansId },
        ],
      });
      if (!seats) {
        throw new NotFoundException('Not found your tickets');
      }
      return seats;
    }
    return [] as CartItem[];
  }

  private readonly logger = new Logger(CartService.name);

  @Cron(CronExpression.EVERY_5_MINUTES)
  async clearOldCarts() {
    const carts = await this.cartRepository.find({
      where: { expirationTime: LessThan(addMinutes(new Date(), -5)) },
    });
    for (let i = 0; i < carts.length; i++) {
      await this.cartItemRepository.delete({ cartId: carts[i].id });
    }
  }
}
