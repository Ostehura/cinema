import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audithorium } from './audithorium.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AudithoriumService {
  constructor(
    @InjectRepository(Audithorium)
    private audithoriumRepository: Repository<Audithorium>,
  ) {}

  getAllAudithoriums(): Promise<Audithorium[]> {
    return this.audithoriumRepository.find();
  }

  async getAudithoriumById(id: number): Promise<Audithorium> {
    const audithorium = await this.audithoriumRepository.findOne({
      where: { id },
    });
    if (!audithorium) {
      throw new NotFoundException(`Audithorium with ID ${id} not found`);
    }
    return audithorium;
  }

  async createAudithorium(
    name: string,
    number_of_rows: number,
    number_of_seats_in_row: number,
  ): Promise<Audithorium> {
    const audithorium = this.audithoriumRepository.create({
      name,
      number_of_rows,
      number_of_seats_in_row,
    });
    return this.audithoriumRepository.save(audithorium);
  }
  async editAudithorium(
    id: number,
    name: string,
    number_of_rows: number,
    number_of_seats_in_row: number,
  ): Promise<Audithorium> {
    await this.audithoriumRepository.update(
      { id },
      { name, number_of_rows, number_of_seats_in_row },
    );
    const audithorium = await this.audithoriumRepository.findOne({
      where: { id },
    });
    if (!audithorium) {
      throw new NotFoundException('Error');
    }
    return audithorium;
  }
}
