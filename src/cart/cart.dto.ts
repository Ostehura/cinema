import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { TicketType } from 'src/ticket/ticket.entity';

export class CartDto {
  @IsInt()
  @Type(() => Number)
  seansId!: number;
  @IsInt()
  @Type(() => Number)
  row!: number;
  @IsInt()
  @Type(() => Number)
  column!: number;
}

export class CartUpdateDto {
  @IsInt()
  @Type(() => Number)
  seansId!: number;
  @IsInt()
  @Type(() => Number)
  row!: number;
  @IsInt()
  @Type(() => Number)
  column!: number;
  @IsEnum(TicketType)
  ticketType!: TicketType;
}

export class CartItemViewDto {
  @Type(() => Number)
  seansId!: number;
  @IsInt()
  @Type(() => Number)
  row!: number;
  @IsInt()
  @Type(() => Number)
  column!: number;
  subototalForamted!: string;
  @IsEnum(TicketType)
  ticketType!: TicketType;
  @IsString()
  filmname!: string;
}

export class CartViewDto {
  @IsInt()
  @Type(() => Number)
  id!: number;
  cartItems?: CartItemViewDto[];
  totalFormated!: string;
  expirationTime?: string;
}
export class CartItemDeleteDto {
  @Type(() => Number)
  seansId!: number;
  @IsInt()
  @Type(() => Number)
  row!: number;
  @IsInt()
  @Type(() => Number)
  column!: number;
}
