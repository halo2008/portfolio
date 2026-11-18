import { Body, Controller, HttpCode, HttpStatus, Logger, Post, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CaptchaGuard } from '../chat/infrastructure/guards/captcha.guard';
import { SlackService } from '../slack/slack.service';
import { formatLeadMessage } from './lead-message';

export class LeadRequestDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @IsEmail()
    @MaxLength(200)
    email!: string;

    @IsString()
    @MinLength(10)
    @MaxLength(3000)
    message!: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    service?: string;

    @IsOptional()
    @IsIn(['pl', 'en'])
    language?: 'pl' | 'en';

    @IsOptional()
    @IsString()
    captcha?: string;

    // Where the visitor came from (utm_* / ref / referrer), for crediting the lead.
    @IsOptional()
    @IsString()
    @MaxLength(200)
    source?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    medium?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    campaign?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    content?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    landing?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    referrer?: string;
}

@Controller('lead')
export class LeadController {
    private readonly logger = new Logger(LeadController.name);

    constructor(private readonly slackService: SlackService) { }

    @Post()
    @Throttle({ short: { limit: 3, ttl: 60000 } })
    @UseGuards(CaptchaGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    async submit(@Body() body: LeadRequestDto): Promise<{ accepted: true }> {
        const delivered = await this.slackService.postMessage(formatLeadMessage(body));
        if (!delivered) {
            this.logger.error({ msg: 'Lead notification not delivered', service: body.service });
            throw new ServiceUnavailableException('Lead could not be delivered');
        }
        this.logger.log({ msg: 'Lead delivered', service: body.service, language: body.language, source: body.source ?? 'direct', campaign: body.campaign });
        return { accepted: true };
    }
}
