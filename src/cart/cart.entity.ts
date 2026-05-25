import { Showtime } from 'src/showtime/showtime.entity';
import { User } from 'src/users/user.entity';
import { TicketType } from 'src/ticket/ticket.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.cart, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  user?: User;

  @Column({ nullable: true })
  guestId?: string;

  @Column({ nullable: true, type: 'timestamptz' })
  expirationTime?: Date;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  cartItems?: CartItem[];
}

@Entity()
export class CartItem {
  @Column()
  cartId!: number;

  @PrimaryColumn()
  row!: number;

  @PrimaryColumn()
  column!: number;

  @PrimaryColumn()
  seansId!: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cartId' })
  cart!: Cart;

  @ManyToOne(() => Showtime, (showtime) => showtime.cartItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seansId' })
  showtime!: Showtime;
  @Column({ type: 'enum', enum: TicketType, default: TicketType.FULL })
  ticketType!: TicketType;
}
