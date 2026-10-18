import { Body, Controller, Delete, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Authenticated, CurrentUserId } from '@shared/auth';
import { ApiErrors } from '@shared/http';
import { plainToInstance } from 'class-transformer';
import { BookingParamsDto, BookingResponseDto, CreateBookingDto } from './booking.dto';
import { BookingService } from './booking.service';

@ApiTags('agendamentos')
@Controller()
@Authenticated()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('bookings')
  @ApiOperation({ summary: 'Agenda um horário para o usuário' })
  @ApiErrors({
    [HttpStatus.BAD_REQUEST]: ['VALIDATION_ERROR', 'INVALID_USER_ID'],
    [HttpStatus.UNAUTHORIZED]: ['MISSING_USER_ID', 'UNKNOWN_USER'],
    [HttpStatus.NOT_FOUND]: ['SLOT_NOT_FOUND'],
    [HttpStatus.CONFLICT]: ['SLOT_UNAVAILABLE', 'BOOKING_OVERLAP'],
    [HttpStatus.UNPROCESSABLE_ENTITY]: ['SLOT_IN_PAST', 'PROFESSIONAL_INACTIVE'],
  })
  async create(
    @CurrentUserId() userId: number,
    @Body() body: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingService.create(userId, body.slotId);
    return plainToInstance(BookingResponseDto, booking, { excludeExtraneousValues: true });
  }

  @Delete('bookings/:id')
  @ApiOperation({ summary: 'Cancela uma sessão do usuário, até 24 horas antes do início' })
  @ApiErrors({
    [HttpStatus.BAD_REQUEST]: ['VALIDATION_ERROR', 'INVALID_USER_ID'],
    [HttpStatus.UNAUTHORIZED]: ['MISSING_USER_ID', 'UNKNOWN_USER'],
    [HttpStatus.NOT_FOUND]: ['BOOKING_NOT_FOUND'],
    [HttpStatus.CONFLICT]: ['BOOKING_ALREADY_CANCELLED'],
    [HttpStatus.UNPROCESSABLE_ENTITY]: ['CANCELLATION_WINDOW_CLOSED'],
  })
  async cancel(
    @CurrentUserId() userId: number,
    @Param() params: BookingParamsDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingService.cancel(userId, params.id);
    return plainToInstance(BookingResponseDto, booking, { excludeExtraneousValues: true });
  }

  @Get('me/bookings')
  @ApiOperation({ summary: 'Sessões do usuário (confirmadas e canceladas), por início' })
  @ApiErrors({
    [HttpStatus.BAD_REQUEST]: ['INVALID_USER_ID'],
    [HttpStatus.UNAUTHORIZED]: ['MISSING_USER_ID', 'UNKNOWN_USER'],
  })
  async listMine(@CurrentUserId() userId: number): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingService.listForUser(userId);
    return plainToInstance(BookingResponseDto, bookings, { excludeExtraneousValues: true });
  }
}
