import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FilmFormat, SeansFormat } from './filmFormat.entity';

@Injectable()
export class FilmFormatService {
  constructor(
    @InjectRepository(FilmFormat)
    private filmFormatRepository: Repository<FilmFormat>,
  ) {}

  async findAll(): Promise<FilmFormat[]> {
    return this.filmFormatRepository.find({ relations: ['film'] });
  }

  async findById(id: string): Promise<FilmFormat> {
    const format = await this.filmFormatRepository.findOne({
      where: { id },
      relations: ['film'],
    });
    if (!format) {
      throw new NotFoundException('Film format not found');
    }
    return format;
  }

  async findByFilmId(filmId: string): Promise<FilmFormat[]> {
    return this.filmFormatRepository.find({
      where: { filmID: filmId },
    });
  }

  async create(
    filmID: string,
    seansFormat: SeansFormat,
    dubbing: string,
  ): Promise<FilmFormat> {
    const format = this.filmFormatRepository.create({
      filmID,
      seansFormat,
      dubbing,
    });
    return this.filmFormatRepository.save(format);
  }

  async update(id: string, filmData: Partial<FilmFormat>): Promise<FilmFormat> {
    await this.filmFormatRepository.update(id, filmData);
    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException('Film format not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.filmFormatRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Film format not found');
    }
  }
}
