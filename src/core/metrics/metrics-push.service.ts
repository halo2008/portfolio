import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as client from 'prom-client';
import { pushTimeseries } from 'prometheus-remote-write';

@Injectable()
export class MetricsPushService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MetricsPushService.name);
    private intervalHandle?: ReturnType<typeof setInterval>;
    private readonly pushIntervalMs = 60_000;

    private readonly remoteWriteUrl = process.env.GRAFANA_REMOTE_WRITE_URL;
    private readonly user = process.env.GRAFANA_METRICS_USER;
    private readonly password = process.env.GRAFANA_METRICS_PASSWORD;

    onModuleInit() {
        if (!this.remoteWriteUrl || !this.user || !this.password) {
            this.logger.warn('Grafana remote write not configured — metrics push disabled');
            return;
        }

        this.logger.log('Starting metrics push to Grafana Cloud (every 60s)');
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
            });

            if (result.status === 200) {
                this.logger.debug(`Pushed ${timeseries.length} timeseries to Grafana Cloud`);
            } else {
                this.logger.warn(`Metrics push returned ${result.status}: ${result.statusText}`);
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
                const labels: { __name__: string; [key: string]: string } = {
                    __name__: metric.name,
                    ...((value.labels as Record<string, string>) || {}),
                };

                // For histograms, append the suffix (le, bucket, sum, count)
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
