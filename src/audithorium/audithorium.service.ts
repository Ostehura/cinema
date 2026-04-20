import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audithorium, AudithoriumFormat } from './audithorium.entity';
import { Repository } from 'typeorm';
import { AudithoriumFormatDTO } from './audithoriumFormatsDTO';
import { SeansFormat } from 'src/films/filmFormat.entity';

@Injectable()
export class AudithoriumService {
  @InjectRepository(Audithorium)
  private readonly audithoriumRepository!: Repository<Audithorium>;
  @InjectRepository(AudithoriumFormat)
  private readonly audithoriumFormatRepository!: Repository<AudithoriumFormat>;
  constructor() {}

  getAllAudithoriums(): Promise<Audithorium[]> {
    return this.audithoriumRepository.find({
      relations: { supportedFormat: true },
    });
  }

  async getAudithoriumById(id: number): Promise<Audithorium> {
    const audithorium = await this.audithoriumRepository.findOne({
      where: { id },
      relations: { supportedFormat: true },
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

  async modifyAudithoriumFormats(
    id: number,
    audithoriumFormatDTO: AudithoriumFormatDTO,
  ) {
    for (const format of Object.values(SeansFormat)) {
      const availableFormat = await this.audithoriumFormatRepository.findOne({
        where: { audithoriumId: id, supportedFormat: format },
      });

      if (
        !availableFormat &&
        !!audithoriumFormatDTO.formats &&
        audithoriumFormatDTO.formats.includes(format)
      ) {
        const newFormat = this.audithoriumFormatRepository.create({
          audithoriumId: id,
          supportedFormat: format,
        });
        await this.audithoriumFormatRepository.save(newFormat);
      }

      if (
        availableFormat &&
        ((!!audithoriumFormatDTO.formats &&
          !audithoriumFormatDTO.formats.includes(format)) ||
          !audithoriumFormatDTO.formats)
      ) {
        await this.audithoriumFormatRepository.delete({
          audithoriumId: id,
          supportedFormat: format,
        });
      }
    }
  }
}
