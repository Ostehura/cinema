import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber } from 'class-validator';
import { SeansFormat } from 'src/films/filmFormat.entity';

export class AudithoriumFormatDTO {
  @IsNumber()
  @Type(() => Number)
  audithoriumID: string | undefined;

  @IsArray()
  @IsEnum(SeansFormat, { each: true })
  formats?: SeansFormat[];
}
