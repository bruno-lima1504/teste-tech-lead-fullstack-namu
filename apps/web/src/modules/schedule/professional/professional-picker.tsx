'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Alert } from '@/modules/shared/alert';
import {
  Brain,
  Check,
  Clock,
  Dumbbell,
  Flower2,
  Salad,
  Sparkles,
  UserRoundSearch,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useProfessionals } from './professional.queries';
import {
  SPECIALTIES,
  SPECIALTY_LABELS,
  type Professional,
  type Specialty,
} from './professional.types';

export const SPECIALTY_META: Record<
  Specialty,
  { icon: LucideIcon; badgeClass: string; avatarClass: string }
> = {
  psicologia: {
    icon: Brain,
    badgeClass: 'border-primary/25 bg-accent text-primary-deep dark:text-primary-glow',
    avatarClass: 'bg-accent text-primary-deep dark:text-primary-glow',
  },
  nutricao: {
    icon: Salad,
    badgeClass:
      'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-500/15 dark:text-emerald-200',
    avatarClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
  },
  'educacao-fisica': {
    icon: Dumbbell,
    badgeClass:
      'border-sky-500/25 bg-sky-500/10 text-sky-800 dark:border-sky-400/25 dark:bg-sky-500/15 dark:text-sky-200',
    avatarClass: 'bg-sky-500/15 text-sky-800 dark:text-sky-200',
  },
  yoga: {
    icon: Flower2,
    badgeClass:
      'border-teal-500/25 bg-teal-500/10 text-teal-800 dark:border-teal-400/25 dark:bg-teal-500/15 dark:text-teal-200',
    avatarClass: 'bg-teal-500/15 text-teal-800 dark:text-teal-200',
  },
};

export const professionalInitials = (name: string): string =>
  name
    .replace(/^Dr(a)?\.\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

interface ProfessionalPickerProps {
  selectedId?: number;
  onSelect: (professional: Professional | undefined) => void;
}

export function ProfessionalPicker({ selectedId, onSelect }: ProfessionalPickerProps) {
  const [specialty, setSpecialty] = useState<Specialty>();
  const professionals = useProfessionals(specialty);

  const filterBy = (value: Specialty | undefined) => {
    setSpecialty(value);
    onSelect(undefined);
  };

  return (
    <fieldset className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="bg-gradient-primary text-primary-foreground shadow-primary flex size-6 items-center justify-center rounded-full text-xs font-bold">
            1
          </span>
          <legend className="text-base font-bold tracking-tight">Escolha o profissional</legend>
        </div>
        <span className="text-muted-foreground text-xs">Pilares de saúde integral</span>
      </div>

      <div
        className="bg-muted flex flex-wrap gap-1.5 rounded-2xl p-1.5"
        role="group"
        aria-label="Filtrar por especialidade"
      >
        {[undefined, ...SPECIALTIES].map((value) => {
          const Icon = value ? SPECIALTY_META[value].icon : Sparkles;
          const isSelected = specialty === value;
          return (
            <button
              key={value ?? 'todas'}
              type="button"
              aria-pressed={isSelected}
              onClick={() => filterBy(value)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/60',
              )}
            >
              <Icon className="size-3.5" />
              {value ? SPECIALTY_LABELS[value] : 'Todas'}
            </button>
          );
        })}
      </div>

      {professionals.isPending && (
        <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
          <p className="sr-only">Carregando profissionais…</p>
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border p-3.5">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {professionals.isError && (
        <Alert tone="error" title="Não foi possível carregar os profissionais">
          {professionals.error.message}
        </Alert>
      )}

      {professionals.data?.length === 0 && (
        <div className="bg-muted/50 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center">
          <UserRoundSearch className="text-muted-foreground size-7" />
          <p className="text-muted-foreground text-sm">
            Nenhum profissional atendendo nesta especialidade.
          </p>
        </div>
      )}

      {professionals.data && professionals.data.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {professionals.data.map((professional) => {
            const meta = SPECIALTY_META[professional.specialty];
            const SpecialtyIcon = meta.icon;
            const isSelected = professional.id === selectedId;

            return (
              <label
                key={professional.id}
                className={cn(
                  'group relative flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border p-4 transition-all duration-200 has-focus-visible:ring-2 has-focus-visible:ring-ring/40',
                  isSelected
                    ? 'border-primary bg-accent/50 shadow-elevated ring-1 ring-primary'
                    : 'bg-card shadow-card hover:border-primary/40 hover:-translate-y-0.5',
                )}
              >
                <input
                  type="radio"
                  name="professional"
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => onSelect(professional)}
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback className={cn('text-xs font-bold', meta.avatarClass)}>
                        {professionalInitials(professional.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-[13px] font-semibold leading-snug">
                      {professional.name}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background group-hover:border-primary/50',
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="size-3 stroke-[2.5]" />}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 border-t pt-2.5">
                  <Badge
                    variant="outline"
                    className={cn('px-2.5 py-0.5 text-[11px]', meta.badgeClass)}
                  >
                    <SpecialtyIcon className="size-3" />
                    {SPECIALTY_LABELS[professional.specialty]}
                  </Badge>
                  <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 text-xs whitespace-nowrap">
                    <Clock className="size-3" />
                    <span className="sr-only">sessões de </span>
                    {`${professional.sessionMinutes} min`}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
