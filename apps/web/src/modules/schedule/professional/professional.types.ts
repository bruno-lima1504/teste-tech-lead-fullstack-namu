export type Specialty = 'psicologia' | 'nutricao' | 'educacao-fisica' | 'yoga';

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  psicologia: 'Psicologia',
  nutricao: 'Nutrição',
  'educacao-fisica': 'Educação física',
  yoga: 'Yoga',
};

export const SPECIALTIES = Object.keys(SPECIALTY_LABELS) as Specialty[];

export interface Professional {
  id: number;
  name: string;
  specialty: Specialty;
  sessionMinutes: number;
}
