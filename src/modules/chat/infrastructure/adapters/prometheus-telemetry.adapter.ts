import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';
import { TelemetryPort } from '../../domain/ports/telemetry.port';
import { PinoLogger } from 'nestjs-pino';

// Define the metric names as constants to ensure consistency
export const METRIC_LLM_LATENCY = 'chat_llm_response_duration_ms';
export const METRIC_VECTOR_SEARCH_LATENCY = 'chat_vector_search_duration_ms';
export const METRIC_LLM_REQUESTS = 'chat_llm_requests_total';
export const METRIC_ACTIVE_WEBSOCKETS = 'chat_active_websockets';

@Injectable()
export class PrometheusTelemetryAdapter implements TelemetryPort {
    constructor(
        // Injecting the Prometheus metrics created by the factory in ChatModule
        @InjectMetric(METRIC_LLM_LATENCY)
        private readonly llmLatencyHistogram: Histogram<string>,

        @InjectMetric(METRIC_VECTOR_SEARCH_LATENCY)
        private readonly vectorSearchLatencyHistogram: Histogram<string>,

        @InjectMetric(METRIC_LLM_REQUESTS)
        private readonly llmRequestsCounter: Counter<string>,

        @InjectMetric(METRIC_ACTIVE_WEBSOCKETS)
        private readonly activeWebSocketsGauge: Gauge<string>,

        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(PrometheusTelemetryAdapter.name);
    }

    observeLlmLatency(durationMs: number): void {
        try {
            this.llmLatencyHistogram.observe(durationMs);
        } catch (error) {
            this.logger.warn(`Failed to observe LLM latency metric: ${error.message}`);
        }
    }

    observeVectorSearchLatency(durationMs: number): void {
        try {
            this.vectorSearchLatencyHistogram.observe(durationMs);
        } catch (error) {
            this.logger.warn(`Failed to observe Vector Search latency metric: ${error.message}`);
        }
    }

    incrementLlmRequests(): void {
        try {
            this.llmRequestsCounter.inc();
        } catch (error) {
            this.logger.warn(`Failed to increment LLM requests metric: ${error.message}`);
        }
    }

    incrementActiveWebSockets(): void {
        try {
            this.activeWebSocketsGauge.inc();
        } catch (error) {
            this.logger.warn(`Failed to increment active WebSockets metric: ${error.message}`);
        }
    }

    decrementActiveWebSockets(): void {
        try {
            this.activeWebSocketsGauge.dec();
        } catch (error) {
            this.logger.warn(`Failed to decrement active WebSockets metric: ${error.message}`);
        }
    }
}
