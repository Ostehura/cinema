import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class AudithotoriumDto {
  @IsInt()
  @Type(() => Number)
  number_of_rows!: number;
  @IsInt()
  @Type(() => Number)
  number_of_seats_in_row!: number;
  @IsString()
  name!: string;
}

export class EditAudithotoriumDto {
  @IsInt()
  @Type(() => Number)
  id!: number;
  @IsInt()
  @Type(() => Number)
  number_of_rows!: number;
  @IsInt()
  @Type(() => Number)
  number_of_seats_in_row!: number;
  @IsString()
  name!: string;
}
