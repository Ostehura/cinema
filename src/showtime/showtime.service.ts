import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, DataSource, In, LessThan, MoreThan, Repository } from 'typeorm';
import { Showtime } from './showtime.entity';
import { FilmFormat, SeansFormat } from 'src/films/filmFormat.entity';
import {
  Audithorium,
  AudithoriumFormat,
} from 'src/audithorium/audithorium.entity';
import { getDateEnd, getDateStart } from './helper';

const BUFFER_MINUTES = 10;

@Injectable()
export class ShowtimeService {
  @InjectRepository(Showtime)
  private readonly showtimeRepository!: Repository<Showtime>;
  constructor(private dataSource: DataSource) {}

  async addShowtime(
    filmId: string,
    seansFormat: SeansFormat,
    audithoriumId: number,
    starttime: Date,
    price: number,
    language: string,
  ) {
    if (starttime < new Date()) {
      throw new BadRequestException('Cannot schedule in the past');
    }
    if (price < 0) {
      throw new BadRequestException('Price should be positive!');
    }
    const dayStart = getDateStart(starttime);

    const dayEnd = getDateEnd(starttime);
    const showtime = await this.dataSource.transaction(
      'SERIALIZABLE',
      async (manager) => {
        const showtimes = await manager.find(Showtime, {
          where: {
            audithoriumId: audithoriumId,
            starttime: And(MoreThan(dayStart), LessThan(dayEnd)),
          },
          order: { starttime: 'ASC' },
          relations: ['filmFormat', 'filmFormat.film'],
        });
        const filmformat = await manager.findOne(FilmFormat, {
          where: {
            filmID: filmId,
            seansFormat: seansFormat,
            dubbing: language,
          },
          relations: { film: true },
        });
        if (!filmformat || !filmformat.film) {
          throw new NotFoundException('Film not found');
        }
        const audithotium = await manager.findOne(AudithoriumFormat, {
          where: {
            audithoriumId: audithoriumId,
            supportedFormat: filmformat?.seansFormat,
          },
        });
        if (!audithotium) {
          throw new NotFoundException(
            'Not existing audithorium or audithorium does not support format',
          );
        }
        const newEnd = new Date(
          starttime.getTime() +
            (filmformat.film.duration + BUFFER_MINUTES) * 60000,
        );
        for (let i = 0; i < showtimes.length; i++) {
          const planedFilm = showtimes[i].filmFormat?.film;
          if (!planedFilm) {
            throw new InternalServerErrorException('Not valid schedule');
          }
          const planedStartTime = showtimes[i].starttime;

          const plannedEnd = new Date(
            planedStartTime.getTime() +
              (planedFilm.duration + BUFFER_MINUTES) * 60000,
          );

          if (starttime < plannedEnd && newEnd > planedStartTime) {
            throw new BadRequestException('Time slot already occupied');
          }
        }
        const newShowtime = manager.create(Showtime, {
          audithoriumId: audithoriumId,
          filmFormatId: filmformat.id,
          price: price,
          starttime: starttime,
          endtime: newEnd,
        });
        await manager.save(Showtime, newShowtime);
        return newShowtime;
      },
    );
    return showtime;
  }
  async getShowtimesByFilmID(filmID: string): Promise<Showtime[]> {
    return await this.showtimeRepository.find({
      where: { filmFormat: { filmID: filmID } },
    });
  }
  async getShowtimesByAudithorium(audithoriumId: number): Promise<Showtime[]> {
    return await this.showtimeRepository.find({
      where: { audithoriumId: audithoriumId },
    });
  }
  async deleteShowtime(id: number): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findOne({ where: { id } });
    if (!showtime) {
      throw new NotFoundException('Showtime does not exist');
    }
    const res = await this.showtimeRepository.remove(showtime);
    if (!res) {
      throw new InternalServerErrorException('Something went wrong');
    }
    return showtime;
  }

  async deleteShowtimeForAudithorium(
    audithoriumId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const showtime = await this.showtimeRepository.find({
      where: {
        audithoriumId: audithoriumId,
        starttime: And(MoreThan(startDate), LessThan(endDate)),
      },
    });
    if (!showtime) {
      throw new NotFoundException('Showtime does not exist');
    }
    const res = await this.showtimeRepository.remove(showtime);
    if (!res) {
      throw new InternalServerErrorException('Something went wrong');
    }
    return true;
  }

  async getAvaiableAudithorium(filmId: string): Promise<Audithorium[]> {
    const audithoriums = await this.dataSource.transaction(
      async (manager): Promise<Audithorium[]> => {
        const formats = (
          await manager.find(FilmFormat, {
            where: { filmID: filmId },
          })
        ).map((filmFormat) => {
          return filmFormat.seansFormat;
        });
        const audithoriums = await manager.find(Audithorium, {
          where: { supportedFormat: { supportedFormat: In(formats) } },
          relations: { supportedFormat: true },
        });
        return audithoriums;
      },
    );
    return audithoriums;
  }

  async getShowsByAudithorium(date: Date, audithoriumId: number) {
    const dayStart = getDateStart(date);

    const dayEnd = getDateEnd(date);

    return this.showtimeRepository.find({
      where: {
        audithoriumId: audithoriumId,
        starttime: And(MoreThan(dayStart), LessThan(dayEnd)),
      },
      relations: { filmFormat: { film: true } },
    });
  }

  async getShowtimePerAudithoriumAndDay(
    audithoriumId: number,
    date: Date,
  ): Promise<Showtime[]> {
    const dayStart = getDateStart(date);

    const dayEnd = getDateEnd(date);

    return await this.showtimeRepository.find({
      where: {
        audithoriumId: audithoriumId,
        starttime: And(MoreThan(dayStart), LessThan(dayEnd)),
      },
      relations: { filmFormat: { film: true } },
    });
  }

  async getShowtimeId(id: number): Promise<Showtime> {
    const show = await this.showtimeRepository.findOne({
      where: { id },
      relations: {
        audithorium: true,
        filmFormat: { film: true },
      },
    });
    if (!show) {
      throw new NotFoundException(`No show time found`);
    }
    return show;
  }
}
