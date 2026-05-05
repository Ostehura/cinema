import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsString } from 'class-validator';
import { SeansFormat } from 'src/films/filmFormat.entity';

export class CreateShowTimeDTO {
  @IsString()
  filmId!: string;
  @IsInt()
  @Type(() => Number)
  audithoriumId!: number;
  @IsInt()
  @Type(() => Number)
  price!: number;
  @IsDate()
  @Type(() => Date)
  starttime!: Date;
  @IsEnum(SeansFormat)
  format!: SeansFormat;
  @IsString()
  language!: string;
}

export class DeleteSHowtimeForAuditoriumDTO{
  @IsInt()
  @Type(()=>Number)
  audithoriumId!: number;
  @IsDate()
  @Type(()=>Date)
  day: Date;

}