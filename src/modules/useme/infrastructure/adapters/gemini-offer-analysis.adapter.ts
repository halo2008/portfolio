import { Injectable, Logger, Inject } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { GOOGLE_GENAI } from '../../../../core/genai/genai.module';
import type { OfferAnalysisPort } from '../../domain/ports/offer-analysis.port';
import { AnalysisResult, JobOffer } from '../../domain/entities/job-offer.entity';
import { Score } from '../../domain/value-objects/score.vo';

const USER_SKILLS = (process.env.USEME_USER_SKILLS || '').split(',').map(s => s.trim()).filter(Boolean);

@Injectable()
export class GeminiOfferAnalysisAdapter implements OfferAnalysisPort {
  private readonly logger = new Logger(GeminiOfferAnalysisAdapter.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  constructor(
    @Inject(GOOGLE_GENAI) private readonly ai: GoogleGenAI,
  ) {}

  async analyzeOffer(offer: JobOffer): Promise<AnalysisResult> {
    return this.executeWithRetry(() => this.callModel(offer));
  }

  private async callModel(offer: JobOffer): Promise<AnalysisResult> {
    const budgetStr = offer.budget ? offer.budget.toString() : 'Nie podano';

    const prompt = `Analyze this freelance job posting from Useme.com and evaluate it for a freelancer.

Title: ${this.sanitizeForPrompt(offer.title)}
Description: ${this.sanitizeForPrompt(offer.description)}
Budget: ${this.sanitizeForPrompt(budgetStr)}
Category: ${this.sanitizeForPrompt(offer.category)}

Freelancer skills: ${JSON.stringify(USER_SKILLS)}

Analyze:
1. Extract concrete requirements from the job posting
2. Match against freelancer's skills
3. Assess the budget (fair/low/high/unknown)
4. Score 0-100 how well this job matches the freelancer
5. Write a 2-3 sentence Polish summary`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedRequirements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of concrete requirements from the job posting',
            },
            matchedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Skills from the freelancer that match this job',
            },
            budgetAssessment: {
              type: Type.STRING,
              enum: ['fair', 'low', 'high', 'unknown'],
              description: 'Assessment of the budget',
            },
            score: {
              type: Type.INTEGER,
              description: 'Match score 0-100',
            },
            summary: {
              type: Type.STRING,
              description: '2-3 sentence summary in Polish',
            },
          },
          required: ['extractedRequirements', 'matchedSkills', 'budgetAssessment', 'score', 'summary'],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini');

    const parsed = JSON.parse(text);
    const clampedScore = Math.max(0, Math.min(100, parsed.score));

    this.logger.log({
      offerId: offer.externalId,
      score: clampedScore,
      matchedSkills: parsed.matchedSkills.length,
    }, 'Offer analyzed');

    return {
      extractedRequirements: parsed.extractedRequirements,
      matchedSkills: parsed.matchedSkills,
      budgetAssessment: parsed.budgetAssessment,
      score: new Score(clampedScore),
      summary: parsed.summary,
    };
  }

  private sanitizeForPrompt(input: string): string {
    return input
      .replace(/```/g, '')
      .replace(/\bignore\b.*\binstructions?\b/gi, '[FILTERED]')
      .replace(/\bforget\b.*\babove\b/gi, '[FILTERED]')
      .substring(0, 2000);
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.MAX_RETRIES) {
          await new Promise(r => setTimeout(r, this.RETRY_DELAY_MS * attempt));
        }
      }
    }

    throw lastError;
  }
}
