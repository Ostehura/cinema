import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsString } from 'class-validator';
import { Audithorium } from 'src/audithorium/audithorium.entity';
import { FilmFormat } from 'src/films/filmFormat.entity';
import { SeansFormat } from 'src/films/seansFomat.enum';

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

export class DeleteSHowtimeForAuditoriumDTO {
  @IsInt()
  @Type(() => Number)
  audithoriumId!: number;
  @IsDate()
  @Type(() => Date)
  day!: Date;
}

export class SeatOutDto {
  column!: number;
  row!: number;
}
export class ShowTimeDTO {
  id!: number;
  filmFormatId!: string;
  audithoriumId!: number;
  price!: number;
  starttime!: Date;
  endtime!: Date;
  audithorium!: Audithorium;
  filmFormat!: FilmFormat;
  yourSeats!: string;
  takenSeats!: string;
}
