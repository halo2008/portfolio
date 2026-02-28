import { Provider, Logger } from '@nestjs/common';
import { WebClient } from '@slack/web-api';

// Explaining: Defining a unique token for the Slack SDK client to be used in Dependency Injection.
export const SLACK_CLIENT = 'SLACK_CLIENT';

export const SlackProvider: Provider = {
  provide: SLACK_CLIENT,
  useFactory: () => {
    const logger = new Logger('SlackProvider');
    const token = process.env.SLACK_BOT_TOKEN;

    // Explaining: SRE best practice - Fail Fast. If the infrastructure is misconfigured, the app shouldn't start.
    if (!token) {
      logger.error('CRITICAL: SLACK_BOT_TOKEN is missing from environment variables.');
      throw new Error('SLACK_CONFIG_ERROR: Missing bot token');
    }

    // Explaining: Initializing the official Slack WebClient for use across the application.
    return new WebClient(token);
  },
};