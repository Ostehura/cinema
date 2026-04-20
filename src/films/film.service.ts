import { Film } from './film.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class FilmService {
  constructor(
    @InjectRepository(Film)
    private filmRepository: Repository<Film>,
  ) {}

  async addFilm(
    title: string,
    director: string,
    duration: number,
  ): Promise<Film> {
    const film = this.filmRepository.create({
      title,
      director,
      duration,
    });
    return this.filmRepository.save(film);
  }

  async findByTitle(
    title: string,
  ): Promise<Film> {
    const film = await this.filmRepository.findOne({
      where: { title }, 
      relations: {filmFormat: true}
    });
    if (!film) {
      throw new NotFoundException('Film not found');
    }
    return film;
  }

  async findById(id: string): Promise<Film> {
    const film = await this.filmRepository.findOne({ where: { id }, relations: {filmFormat: true} });
    if (!film) {
      throw new NotFoundException('Film not found');
    }
    return film;
  }

  async updateFilm(id: string, filmData: Partial<Film>): Promise<Film> {
    await this.filmRepository.update(id, filmData);
    const updatedFilm = await this.findById(id);
    if (!updatedFilm) {
      throw new NotFoundException('Film not found after update');
    }
    return updatedFilm;
  }

  async deleteFilm(id: string): Promise<void> {
    const result = await this.filmRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Film not found');
    }
  }
}
