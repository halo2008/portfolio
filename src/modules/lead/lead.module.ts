import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CaptchaGuard } from '../chat/infrastructure/guards/captcha.guard';
import { LeadController } from './lead.controller';

@Module({
    imports: [HttpModule],
    controllers: [LeadController],
    providers: [CaptchaGuard],
})
export class LeadModule { }
