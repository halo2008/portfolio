import { Provider, Logger } from '@nestjs/common';
import { WebClient } from '@slack/web-api';

export const SLACK_CLIENT = 'SLACK_CLIENT';

export const SlackProvider: Provider = {
  provide: SLACK_CLIENT,
  useFactory: () => {
    const logger = new Logger('SlackProvider');
    const token = process.env.SLACK_BOT_TOKEN;

    if (!token) {
      logger.error('CRITICAL: SLACK_BOT_TOKEN is missing from environment variables.');
      throw new Error('SLACK_CONFIG_ERROR: Missing bot token');
    }

    return new WebClient(token);
  },
};