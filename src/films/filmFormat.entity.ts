import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Film } from './film.entity';
import { Showtime } from 'src/showtime/showtime.entity';
import { SeansFormat } from './seansFomat.enum';

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

  @Column()
  dubbing!: string;

  @OneToMany(() => Showtime, (showtime) => showtime.filmFormat)
  showtimes?: Showtime[];
}
