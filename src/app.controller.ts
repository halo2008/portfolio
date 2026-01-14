import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

    @Get()
    root() {
        return { message: 'API is running' };
    }

    @Get('health')
    healthCheck() {
        return { status: 'OK', timestamp: new Date().toISOString() };
    }
}
