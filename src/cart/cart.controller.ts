import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OptionalJwtAuthGuard } from 'src/auth/optionalauth.guard';
import type { RequestWithUser } from 'src/helper/requestWIthUser';
import {
  CartDto,
  CartItemDeleteDto,
  CartItemViewDto,
  CartUpdateDto,
  CartViewDto,
} from './cart.dto';
import { CartItem, TicketType } from './cart.entity';
import { CartService } from './cart.service';
import { Money } from 'src/helper/money';
import { BookingService } from 'src/bookings/booking.service';
import { addMinutes } from 'src/helper/time';

function TicketFare(ticketType: TicketType) {
  return ticketType == TicketType.FULL ? 1 : 0.8;
}

@Controller('cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private bookingService: BookingService,
  ) {}
  @Post('add')
  @UseGuards(OptionalJwtAuthGuard)
  async addToCart(@Req() req: RequestWithUser, @Body() dto: CartDto) {
    return await this.cartService.addProductToCart(
      req.user?.userId ?? null,
      req.cookies.guest_id,
      dto,
    );
  }
  @Get()
  @Render('cart')
  @UseGuards(OptionalJwtAuthGuard)
  async getCart(@Req() req: RequestWithUser): Promise<CartViewDto> {
    const cart = await this.cartService.getCart(
      req.user?.userId ?? null,
      req.cookies.guest_id,
    );
    if (!cart || !cart.cartItems) {
      return { id: -1, totalFormated: new Money(0, 'PLN').toString() };
    }
    if (
      cart.expirationTime &&
      addMinutes(cart.expirationTime, 5) < new Date()
    ) {
      return { id: -1, totalFormated: new Money(0, 'PLN').toString() };
    }
    let total = new Money(0, 'PLN');
    for (let i = 0; i < cart.cartItems.length; i++) {
      total = total.add(
        new Money(cart.cartItems[i].showtime.price, 'PLN').multiply(
          TicketFare(cart.cartItems[i].ticketType),
        ),
      );
    }
    const res: CartViewDto = {
      id: cart.id,
      expirationTime: cart.expirationTime ? cart.expirationTime.toString() : '',
      totalFormated: total.toString(),
      cartItems: cart.cartItems.map((item: CartItem) => {
        const cartItemFormated: CartItemViewDto = {
          column: item.column,
          row: item.row,
          ticketType: item.ticketType,
          seansId: item.seansId,
          filmname:
            (item.showtime.filmFormat?.film?.title ?? '') +
            ' | dubbing:' +
            (item.showtime.filmFormat?.dubbing ?? '') +
            ' <br/> at: ' +
            (item.showtime.starttime.toLocaleString() ?? ''),
          subototalForamted: new Money(item.showtime.price, 'PLN')
            .multiply(TicketFare(item.ticketType))
            .toString(),
        };
        return cartItemFormated;
      }),
    };
    return res;
  }

  @Post('remove')
  @Redirect('/cart')
  @UseGuards(OptionalJwtAuthGuard)
  async removeCart(
    @Req() req: RequestWithUser,
    @Body() dto: CartItemDeleteDto,
  ) {
    try {
      return await this.cartService.deleteCart(
        req.user?.userId ?? null,
        req.cookies.guest_id,
        dto,
      );
    } catch (e: any) {
      console.log(e);
    }
  }

  @Get('merge')
  @Redirect('/')
  @UseGuards(OptionalJwtAuthGuard)
  async merge(@Req() req: RequestWithUser) {
    if (!req.user || !req.user.userId) {
      throw new BadRequestException('');
    }
    await this.cartService.mergeGuestCartIntoUser(
      req.cookies.guest_id,
      req.user.userId ?? null,
    );
  }
  @Redirect('/cart')
  @Post('update')
  @UseGuards(OptionalJwtAuthGuard)
  async updateItem(@Req() req: RequestWithUser, @Body() dto: CartUpdateDto) {
    await this.cartService.updateItem(
      req.user?.userId ?? null,
      req.cookies.guest_id,
      dto,
    );
  }

  @Get('place')
  @Render('checkout')
  @UseGuards(OptionalJwtAuthGuard)
  async showCheckOutPage(@Req() req: RequestWithUser) {
    const cart = await this.cartService.getCart(
      req.user?.userId ?? null,
      req.cookies.guest_id,
    );
    if (!cart || !cart.cartItems) {
      return { id: -1, totalFormated: new Money(0, 'PLN').toString() };
    }
    if (
      cart.expirationTime &&
      addMinutes(cart.expirationTime, 5) < new Date()
    ) {
      return { id: -1, totalFormated: new Money(0, 'PLN').toString() };
    }

    let total = new Money(0, 'PLN');
    for (let i = 0; i < cart.cartItems.length; i++) {
      total = total.add(
        new Money(cart.cartItems[i].showtime.price, 'PLN').multiply(
          TicketFare(cart.cartItems[i].ticketType),
        ),
      );
    }
    const res = {
      logged_in: req.user ? true : false,
      totalFormated: total.toString(),
      cartItems: cart.cartItems.map((item: CartItem) => {
        const cartItemFormated: CartItemViewDto = {
          column: item.column,
          row: item.row,
          ticketType: item.ticketType,
          seansId: item.seansId,
          filmname:
            (item.showtime.filmFormat?.film?.title ?? '') +
            ' | dubbing:' +
            (item.showtime.filmFormat?.dubbing ?? '') +
            ' <br/> at: ' +
            (item.showtime.starttime.toLocaleString() ?? ''),
          subototalForamted: new Money(item.showtime.price, 'PLN')
            .multiply(TicketFare(item.ticketType))
            .toString(),
        };
        return cartItemFormated;
      }),
    };
    return res;
  }

  @Post('place')
  @Redirect('/booking/my')
  @UseGuards(OptionalJwtAuthGuard)
  async PlaceOrder(
    @Req() req: RequestWithUser,
    @Body() body: { guest_email?: string },
  ) {
    return await this.bookingService.placeBooking(
      req.user?.userId ?? null,
      req.cookies.guest_id,
      body.guest_email ?? null,
    );
  }
}
