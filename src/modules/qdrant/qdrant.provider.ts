import { Provider, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

export const QDRANT_CLIENT = 'QDRANT_CLIENT';

export const QdrantProvider: Provider = {
  provide: QDRANT_CLIENT,
  useFactory: () => {
    const logger = new Logger('QdrantProvider');

    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;

    // Explaining: Standard SRE validation. Do not leak secrets in logs.
    if (!url || !apiKey) {
      logger.error('CRITICAL: Qdrant configuration is incomplete. Check environment variables.');
      throw new Error('QDRANT_CONFIG_ERROR');
    }

    try {
      // Explaining: Returning a pre-configured client for the entire system.
      return new QdrantClient({
        url,
        apiKey,
      });
    } catch (error) {
      logger.error(`Failed to initialize Qdrant Client: ${error.message}`);
      throw error;
    }
  },
};