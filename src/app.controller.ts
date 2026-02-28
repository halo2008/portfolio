import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

    @Get()
    root() {
        return {
            message: 'API is running',
            docs: '/api/docs', // Placeholder if swagger is added later
            version: process.env.npm_package_version || '0.0.1'
        };
    }

    @Get('health')
    healthCheck() {
        const memoryUsage = process.memoryUsage();
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            }
        };
    }
}
