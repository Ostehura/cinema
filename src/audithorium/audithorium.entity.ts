import { SeansFormat } from 'src/films/filmFormat.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToMany(
    () => AudithoriumFormat,
    (audithoriumFormat) => audithoriumFormat.audithorium,
  )
  supportedFormat?: AudithoriumFormat[];

  get capacity(): number {
    return this.number_of_rows * this.number_of_seats_in_row;
  }
  capacity_evalueted?: number;
}

@Entity()
export class AudithoriumFormat {
  @PrimaryColumn()
  audithoriumId!: number;
  @PrimaryColumn({ type: 'enum', enum: SeansFormat, default: SeansFormat.F2D })
  supportedFormat!: SeansFormat;
  @ManyToOne(() => Audithorium, (audithorium) => audithorium.supportedFormat, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'audithoriumId' })
  audithorium?: Audithorium;
}
