import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Cart } from 'src/cart/cart.entity';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role!: UserRole;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart?: Cart;
}
