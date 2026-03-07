import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

export const METRIC_LAB_ANALYSIS_TOTAL = 'lab_analysis_total';
export const METRIC_LAB_INDEXING_TOTAL = 'lab_indexing_total';
export const METRIC_LAB_CHAT_TOTAL = 'lab_chat_total';
export const METRIC_LAB_EMBEDDING_DURATION = 'lab_embedding_duration_ms';
export const METRIC_LAB_CHUNKS_INDEXED = 'lab_chunks_indexed_total';
export const METRIC_LAB_SEARCH_DURATION = 'lab_search_duration_ms';
export const METRIC_LAB_LLM_DURATION = 'lab_llm_duration_ms';
export const METRIC_LAB_CHAT_TOTAL_DURATION = 'lab_chat_total_duration_ms';

@Injectable()
export class LabMetricsService {
    constructor(
        @InjectMetric(METRIC_LAB_ANALYSIS_TOTAL)
        private readonly analysisCounter: Counter<string>,
        @InjectMetric(METRIC_LAB_INDEXING_TOTAL)
        private readonly indexingCounter: Counter<string>,
        @InjectMetric(METRIC_LAB_CHAT_TOTAL)
        private readonly chatCounter: Counter<string>,
        @InjectMetric(METRIC_LAB_EMBEDDING_DURATION)
        private readonly embeddingDuration: Histogram<string>,
        @InjectMetric(METRIC_LAB_CHUNKS_INDEXED)
        private readonly chunksIndexed: Counter<string>,
        @InjectMetric(METRIC_LAB_SEARCH_DURATION)
        private readonly searchDuration: Histogram<string>,
        @InjectMetric(METRIC_LAB_LLM_DURATION)
        private readonly llmDuration: Histogram<string>,
        @InjectMetric(METRIC_LAB_CHAT_TOTAL_DURATION)
        private readonly chatTotalDuration: Histogram<string>,
    ) { }

    recordAnalysis(userId: string, language: string): void {
        this.analysisCounter.inc({ user_id: userId.slice(0, 8), language });
    }

    recordIndexing(userId: string, chunkCount: number): void {
        this.indexingCounter.inc({ user_id: userId.slice(0, 8) });
        this.chunksIndexed.inc({ user_id: userId.slice(0, 8) }, chunkCount);
    }

    recordChat(userId: string, language: string): void {
        this.chatCounter.inc({ user_id: userId.slice(0, 8), language });
    }

    recordChatTimings(timings: { embeddingMs: number; searchMs: number; llmMs: number; totalMs: number }): void {
        this.embeddingDuration.observe({ operation: 'chat' }, timings.embeddingMs);
        this.searchDuration.observe(timings.searchMs);
        this.llmDuration.observe(timings.llmMs);
        this.chatTotalDuration.observe(timings.totalMs);
    }

    observeEmbeddingDuration(durationMs: number, operation: string): void {
        this.embeddingDuration.observe({ operation }, durationMs);
    }
}
