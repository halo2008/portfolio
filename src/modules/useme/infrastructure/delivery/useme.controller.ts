import { Controller, Post, UseGuards, Logger, HttpCode } from '@nestjs/common';
import { ProcessNewOffersUseCase } from '../../application/use-cases/process-new-offers.use-case';
import { PollAuthGuard } from '../guards/poll-auth.guard';

@Controller('useme')
export class UsemeController {
  private readonly logger = new Logger(UsemeController.name);

  constructor(
    private readonly processNewOffers: ProcessNewOffersUseCase,
  ) {}

  @Post('poll')
  @HttpCode(200)
  @UseGuards(PollAuthGuard)
  async poll() {
    this.logger.log('Poll triggered');
    const result = await this.processNewOffers.execute();
    return {
      status: 'ok',
      ...result,
    };
  }
}
