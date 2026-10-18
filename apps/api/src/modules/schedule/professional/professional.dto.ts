import { Expose } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { Specialty } from './professional.types';

export class ListProfessionalsQueryDto {
  @IsOptional()
  @IsEnum(Specialty, {
    message: `deve ser uma destas especialidades: ${Object.values(Specialty).join(', ')}`,
  })
  specialty?: Specialty;
}

export class ProfessionalResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  specialty: Specialty;

  @Expose()
  sessionMinutes: number;
}
