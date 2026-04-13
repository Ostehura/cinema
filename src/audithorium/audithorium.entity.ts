import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Audithorium {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  number_of_rows!: number;

  @Column()
  number_of_seats_in_row!: number;

  get capacity(): number {
    return this.number_of_rows * this.number_of_seats_in_row;
  }
  capacity_evalueted?: number;
}
