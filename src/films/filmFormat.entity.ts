import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Film } from './film.entity';

export enum SeansFormat {
  IMAX = 'IMAX',
  F2D = '2D',
  F3D = '3D',
  F4DX = '4DX',
}

@Entity()
export class FilmFormat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  filmID!: string;

  @Column({ type: 'enum', enum: SeansFormat, default: SeansFormat.F2D })
  seansFormat!: SeansFormat;

  @ManyToOne(() => Film, (film) => film.filmFormat, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'filmID' })
  film?: Film;
}
