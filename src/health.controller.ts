import { Controller, Get } from '@nestjs/common';

@Controller('internal/status')
export class HealthController {
    @Get()
    check() {
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
}
