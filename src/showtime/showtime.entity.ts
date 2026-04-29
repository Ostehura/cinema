import { Audithorium } from 'src/audithorium/audithorium.entity';
import { FilmFormat } from 'src/films/filmFormat.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Showtime {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  filmFormatId!: string;
  @Column({ type: 'int' })
  audithoriumId!: number;
  @Column({ type: 'int' })
  price!: number;
  @Column({ type: 'timestamptz' })
  starttime!: Date;
  @ManyToOne(() => Audithorium, (audithorium) => audithorium.showtimes)
  @JoinColumn({ name: 'audithoriumId' })
  audithorium?: Audithorium;

  @ManyToOne(() => FilmFormat, (filmFormat) => filmFormat.showtimes)
  @JoinColumn({ name: 'filmFormatId' })
  filmFormat?: FilmFormat;
}
