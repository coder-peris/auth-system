import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportDto } from './dto/support.dto';
import type { Request } from 'express';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitSupportRequest(@Body() dto: SupportDto, @Req() req: Request) {
    // Add technical details from request
    const enrichedDto = {
      ...dto,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };

    return await this.supportService.submitSupportRequest(enrichedDto);
  }
}
