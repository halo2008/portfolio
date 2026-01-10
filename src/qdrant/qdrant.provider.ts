import { Provider, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

export const QDRANT_CLIENT = 'QDRANT_CLIENT';

export const QdrantProvider: Provider = {
  provide: QDRANT_CLIENT,
  useFactory: () => {
    const logger = new Logger('QdrantProvider');

    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;

    logger.log('--- QDRANT CONNECTION DEBUG ---');
    logger.log(`URL available: ${!!url}`);
    logger.log(`URL value: "${url}"`);
    logger.log(`API Key available: ${!!apiKey}`);

    if (apiKey) {
      logger.log(`API Key length: ${apiKey.length}`);
      logger.log(`API Key start: ${apiKey.substring(0, 5)}...`);
      logger.log(`API Key end: ...${apiKey.substring(apiKey.length - 5)}`);
    } else {
      logger.error('CRITICAL: API Key is missing/undefined!');
    }
    logger.log('-------------------------------');

    

    return new QdrantClient({
      url: url,
      apiKey: apiKey,
    });
  },
};