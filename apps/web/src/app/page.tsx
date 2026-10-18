import { Badge } from '@/components/ui/badge';
import { BookingPanel } from '@/modules/schedule/booking/booking-panel';
import { MyBookings } from '@/modules/schedule/booking/my-bookings';
import { UserSelect } from '@/modules/shared/user-select';
import { HeartPulse, ShieldCheck, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="bg-background/95 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary text-primary-foreground shadow-primary flex size-10 items-center justify-center rounded-2xl">
              <HeartPulse className="size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">Namu</span>
                <Badge variant="secondary" className="hidden text-[11px] sm:inline-flex">
                  Saúde Integral
                </Badge>
              </div>
              <span className="text-muted-foreground hidden text-xs sm:inline">
                Alimentação, mente e movimento em um só lugar
              </span>
            </div>
          </div>

          <UserSelect />
        </div>
      </header>

      <section className="bg-gradient-hero relative overflow-hidden border-b text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-1/4 size-80 rounded-full opacity-25 blur-3xl"
          style={{ background: 'var(--primary)' }}
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-between gap-4 px-4 py-8 sm:flex-row sm:items-end sm:px-6 sm:py-10">
          <div className="flex flex-col gap-2">
            <div className="border-primary/30 bg-primary/15 text-primary-glow inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
              <Sparkles className="size-3" />
              Cuidado no seu ritmo
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Agendamento de <span className="text-primary-glow">sessões</span>
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Escolha um especialista, um horário livre e confirme sua sessão.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-white/85 backdrop-blur-xs">
            <ShieldCheck className="text-primary-glow size-4 shrink-0" />
            <span>Reserva imediata sem conflito de horários</span>
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <BookingPanel />
          </div>
          <div className="lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
            <MyBookings />
          </div>
        </div>
      </main>
    </div>
  );
}
