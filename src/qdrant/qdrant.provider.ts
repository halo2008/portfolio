import { Provider } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

export const QDRANT_CLIENT = 'QDRANT_CLIENT';

export const QdrantProvider: Provider = {
  provide: QDRANT_CLIENT,
  useFactory: () => {
    return new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
  },
};