import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';

export const METRIC_HTTP_DURATION = 'http_requests_duration_seconds';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
    constructor(
        @InjectMetric(METRIC_HTTP_DURATION)
        private readonly histogram: Histogram<string>
    ) { }

    use(req: Request, res: Response, next: NextFunction) {
        const startTimer = this.histogram.startTimer();
        const { method, originalUrl } = req;

        // Skip metrics endpoint itself
        if (originalUrl === '/metrics') {
            return next();
        }

        res.on('finish', () => {
            const statusCode = res.statusCode.toString();
            // We group routes slightly by removing UUIDs/IDs to prevent metric cardinality explosion,
            // but for a simple portfolio, `originalUrl` is mostly fine.
            const route = originalUrl.split('?')[0];

            startTimer({
                method,
                route,
                status_code: statusCode,
            });
        });

        next();
    }
}
