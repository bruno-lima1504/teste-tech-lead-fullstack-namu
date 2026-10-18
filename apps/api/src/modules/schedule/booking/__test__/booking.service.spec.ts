import { ClsPluginTransactional, NoOpTransactionalAdapter } from '@nestjs-cls/transactional';
import { Test } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import {
  bookingFactory,
  professionalFactory,
  slotFactory,
} from '../../__test__/factory/entity.test-factory';
import { ProfessionalInactiveException } from '../../professional/professional.exception';
import { ProfessionalRepository } from '../../professional/professional.repository';
import { SCHEDULE_CONNECTION } from '../../shared/persistence/schedule-connection';
import { SlotInPastException, SlotNotFoundException } from '../../slot/slot.exception';
import { SlotRepository } from '../../slot/slot.repository';
import { UnknownUserException } from '../../user/user.exception';
import { UserRepository } from '../../user/user.repository';
import { addHours, addMinutes } from 'date-fns';
import {
  BookingAlreadyCancelledException,
  BookingNotFoundException,
  BookingOverlapException,
  CancellationWindowClosedException,
  SlotUnavailableException,
} from '../booking.exception';
import { BookingRepository } from '../booking.repository';
import { BookingService } from '../booking.service';
import { BookingStatus } from '../booking.types';

describe('BookingService', () => {
  const now = new Date('2026-10-17T12:00:00Z');
  const userRepository = { lockById: jest.fn(), existsById: jest.fn() };
  const slotRepository = { lockById: jest.fn() };
  const professionalRepository = { findOneById: jest.fn() };
  const bookingRepository = {
    hasConfirmedForSlot: jest.fn(),
    userHasConfirmedOverlapping: jest.fn(),
    createConfirmed: jest.fn(),
    lockByIdWithSlotAndProfessional: jest.fn(),
    markCancelled: jest.fn(),
  };
  let service: BookingService;

  // Cenário em que tudo permite agendar; cada teste quebra uma regra.
  const slot = slotFactory.build({
    id: 4,
    professionalId: 1,
    startsAt: new Date('2026-10-19T18:00:00Z'),
    endsAt: new Date('2026-10-19T18:50:00Z'),
  });
  const professional = professionalFactory.build({ id: 1, active: true });

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.useFakeTimers({ now });
    userRepository.lockById.mockResolvedValue(true);
    slotRepository.lockById.mockResolvedValue(slot);
    professionalRepository.findOneById.mockResolvedValue(professional);
    bookingRepository.hasConfirmedForSlot.mockResolvedValue(false);
    bookingRepository.userHasConfirmedOverlapping.mockResolvedValue(false);
    bookingRepository.createConfirmed.mockResolvedValue(
      bookingFactory.build({ id: 10, userId: 1, slotId: 4 }),
    );

    const module = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          plugins: [
            new ClsPluginTransactional({
              connectionName: SCHEDULE_CONNECTION,
              adapter: new NoOpTransactionalAdapter({ tx: {}, disableWarning: true }),
            }),
          ],
        }),
      ],
      providers: [
        BookingService,
        { provide: UserRepository, useValue: userRepository },
        { provide: SlotRepository, useValue: slotRepository },
        { provide: ProfessionalRepository, useValue: professionalRepository },
        { provide: BookingRepository, useValue: bookingRepository },
      ],
    }).compile();
    service = module.get(BookingService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('agenda e devolve a sessão com horário e profissional', async () => {
      const booking = await service.create(1, 4);

      expect(bookingRepository.createConfirmed).toHaveBeenCalledWith(1, 4);
      expect(booking).toMatchObject({ id: 10, slot: { id: 4, professional: { id: 1 } } });
    });

    it('recusa usuário que não existe', async () => {
      userRepository.lockById.mockResolvedValue(false);

      await expect(service.create(99, 4)).rejects.toBeInstanceOf(UnknownUserException);
      expect(slotRepository.lockById).not.toHaveBeenCalled();
    });

    it('recusa horário que não existe', async () => {
      slotRepository.lockById.mockResolvedValue(null);

      await expect(service.create(1, 999)).rejects.toBeInstanceOf(SlotNotFoundException);
    });

    it('recusa horário de profissional inativo', async () => {
      professionalRepository.findOneById.mockResolvedValue(
        professionalFactory.build({ active: false }),
      );

      await expect(service.create(1, 4)).rejects.toBeInstanceOf(ProfessionalInactiveException);
    });

    it('recusa horário que começa agora', async () => {
      slotRepository.lockById.mockResolvedValue(slotFactory.build({ startsAt: now }));

      await expect(service.create(1, 4)).rejects.toBeInstanceOf(SlotInPastException);
    });

    it('recusa horário que já tem agendamento confirmado', async () => {
      bookingRepository.hasConfirmedForSlot.mockResolvedValue(true);

      await expect(service.create(1, 4)).rejects.toBeInstanceOf(SlotUnavailableException);
      expect(bookingRepository.createConfirmed).not.toHaveBeenCalled();
    });

    it('recusa quando o usuário já tem sessão confirmada que se sobrepõe', async () => {
      bookingRepository.userHasConfirmedOverlapping.mockResolvedValue(true);

      await expect(service.create(1, 4)).rejects.toBeInstanceOf(BookingOverlapException);
      expect(bookingRepository.userHasConfirmedOverlapping).toHaveBeenCalledWith(1, slot);
      expect(bookingRepository.createConfirmed).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    // Sessão confirmada da usuária 1, daqui a 2 dias; cada teste quebra uma regra.
    const bookingStartingIn = (hours: number, minutes = 0) =>
      bookingFactory.build({
        id: 20,
        userId: 1,
        status: BookingStatus.Confirmed,
        slot: slotFactory.build({ startsAt: addMinutes(addHours(now, hours), minutes) }),
      });

    beforeEach(() => {
      userRepository.existsById.mockResolvedValue(true);
      bookingRepository.lockByIdWithSlotAndProfessional.mockResolvedValue(bookingStartingIn(48));
      bookingRepository.markCancelled.mockImplementation((booking) =>
        Promise.resolve({ ...booking, status: BookingStatus.Cancelled }),
      );
    });

    it('cancela a sessão do próprio usuário', async () => {
      await expect(service.cancel(1, 20)).resolves.toMatchObject({
        id: 20,
        status: BookingStatus.Cancelled,
      });
    });

    it('responde como inexistente para a sessão de outro usuário', async () => {
      await expect(service.cancel(2, 20)).rejects.toBeInstanceOf(BookingNotFoundException);
      expect(bookingRepository.markCancelled).not.toHaveBeenCalled();
    });

    it('recusa sessão já cancelada', async () => {
      bookingRepository.lockByIdWithSlotAndProfessional.mockResolvedValue(
        bookingFactory.build({ id: 20, userId: 1, status: BookingStatus.Cancelled }),
      );

      await expect(service.cancel(1, 20)).rejects.toBeInstanceOf(BookingAlreadyCancelledException);
    });

    it('cancela com exatamente 24 horas de antecedência', async () => {
      bookingRepository.lockByIdWithSlotAndProfessional.mockResolvedValue(bookingStartingIn(24));

      await expect(service.cancel(1, 20)).resolves.toMatchObject({
        status: BookingStatus.Cancelled,
      });
    });

    it('recusa com menos de 24 horas de antecedência', async () => {
      bookingRepository.lockByIdWithSlotAndProfessional.mockResolvedValue(
        bookingStartingIn(23, 59),
      );

      await expect(service.cancel(1, 20)).rejects.toBeInstanceOf(CancellationWindowClosedException);
      expect(bookingRepository.markCancelled).not.toHaveBeenCalled();
    });
  });
});
