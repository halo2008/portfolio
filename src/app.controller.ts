import { Controller, Get } from '@nestjs/common';

@Controller('health') // To stworzy endpoint: /api/health (bo masz global prefix 'api')
export class AppController {

    @Get()
    healthCheck() {
        return { status: 'OK', timestamp: new Date().toISOString() };
    }
}
