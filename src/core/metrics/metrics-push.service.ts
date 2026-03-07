import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as client from 'prom-client';
import { pushTimeseries } from 'prometheus-remote-write';

@Injectable()
export class MetricsPushService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MetricsPushService.name);
    private intervalHandle?: ReturnType<typeof setInterval>;
    private readonly pushIntervalMs = 15_000;

    private readonly remoteWriteUrl = process.env.GRAFANA_REMOTE_WRITE_URL;
    private readonly user = process.env.GRAFANA_METRICS_USER;
    private readonly password = process.env.GRAFANA_METRICS_PASSWORD;

    onModuleInit() {
        if (!this.remoteWriteUrl || !this.user || !this.password) {
            this.logger.warn('Grafana remote write not configured — metrics push disabled');
            return;
        }

        this.logger.log('Starting metrics push to Grafana Cloud (every 15s)');
        this.push();
        this.intervalHandle = setInterval(() => this.push(), this.pushIntervalMs);
    }

    onModuleDestroy() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
    }

    private async push(): Promise<void> {
        try {
            const metrics = await client.register.getMetricsAsJSON();

            const timeseries = this.convertToTimeSeries(metrics);

            if (timeseries.length === 0) return;

            const result = await pushTimeseries(timeseries, {
                url: this.remoteWriteUrl!,
                auth: {
                    username: this.user!,
                    password: this.password!,
                },
                verbose: true,
                console: {
                    info: (...args: unknown[]) => this.logger.log(args.join(' ')),
                    warn: (...args: unknown[]) => this.logger.warn(args.join(' ')),
                } as any,
            });

            if (result.status >= 200 && result.status < 300) {
                this.logger.log(`Pushed ${timeseries.length} timeseries to Grafana Cloud (${result.status})`);
            } else {
                this.logger.warn(`Metrics push returned ${result.status}: ${result.statusText} ${(result as any).errorMessage || ''}`);
            }
        } catch (error) {
            this.logger.error(
                `Failed to push metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    private convertToTimeSeries(metrics: client.MetricObjectWithValues<client.MetricValue<string>>[]) {
        const now = Date.now();
        const series: Array<{
            labels: { __name__: string; [key: string]: string };
            samples: Array<{ value: number; timestamp: number }>;
        }> = [];

        for (const metric of metrics) {
            for (const value of metric.values) {
                // Stringify all label values (prom remote write requires strings)
                const rawLabels = (value.labels || {}) as Record<string, unknown>;
                const stringLabels: Record<string, string> = {};
                for (const [k, v] of Object.entries(rawLabels)) {
                    stringLabels[k] = String(v);
                }

                const labels: { __name__: string; [key: string]: string } = {
                    __name__: metric.name,
                    ...stringLabels,
                };

                if ('metricName' in value && typeof value.metricName === 'string') {
                    labels.__name__ = value.metricName;
                }

                series.push({
                    labels,
                    samples: [{ value: Number(value.value), timestamp: now }],
                });
            }
        }

        return series;
    }
}
