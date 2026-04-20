import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FilmFormat } from './filmFormat.entity';

@Entity()
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @Column({ unique: true })
  @Column()
  title!: string;

  @Column()
  director!: string;

  @Column({ type: 'int' })
  duration!: number;

  @OneToMany(() => FilmFormat, (filmFormat) => filmFormat.film)
  filmFormat?: FilmFormat[];
}
