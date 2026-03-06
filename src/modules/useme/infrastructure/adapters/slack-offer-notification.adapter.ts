import { Injectable, Logger } from '@nestjs/common';
import { SlackService } from '../../../slack/slack.service';
import type { OfferNotificationPort } from '../../domain/ports/offer-notification.port';
import { JobOffer } from '../../domain/entities/job-offer.entity';

@Injectable()
export class SlackOfferNotificationAdapter implements OfferNotificationPort {
  private readonly logger = new Logger(SlackOfferNotificationAdapter.name);

  constructor(private readonly slackService: SlackService) {}

  async notify(offer: JobOffer): Promise<void> {
    const analysis = offer.analysis;
    if (!analysis) return;

    const budgetLine = offer.budget ? offer.budget.toString() : 'Nie podano';
    const skills = analysis.matchedSkills.length > 0
      ? analysis.matchedSkills.join(', ')
      : 'Brak dopasowanych';
    const requirements = analysis.extractedRequirements
      .map(r => `  - ${r}`)
      .join('\n');

    const message = [
      `*Nowe zlecenie Useme* (score: ${analysis.score.value}/100)`,
      `*Tytul:* ${offer.title}`,
      `*Budzet:* ${budgetLine} (${analysis.budgetAssessment})`,
      `*Kategoria:* ${offer.category}`,
      `*Dopasowane skille:* ${skills}`,
      `*Wymagania:*\n${requirements}`,
      `*Podsumowanie:* ${analysis.summary}`,
      `*Link:* ${offer.url}`,
    ].join('\n');

    await this.slackService.logNewConversation(message, `useme-${offer.externalId}`);
    this.logger.log(`Slack notification sent for offer ${offer.externalId}`);
  }
}
