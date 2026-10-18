import { Body, Controller, Get, Post } from '@nestjs/common';
import { Authenticated, CurrentUserId } from '@shared/auth';
import { plainToInstance } from 'class-transformer';
import { BookingResponseDto, CreateBookingDto } from './booking.dto';
import { BookingService } from './booking.service';

@Controller()
@Authenticated()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('bookings')
  async create(
    @CurrentUserId() userId: number,
    @Body() body: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingService.create(userId, body.slotId);
    return plainToInstance(BookingResponseDto, booking, { excludeExtraneousValues: true });
  }

  @Get('me/bookings')
  async listMine(@CurrentUserId() userId: number): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingService.listForUser(userId);
    return plainToInstance(BookingResponseDto, bookings, { excludeExtraneousValues: true });
  }
}
