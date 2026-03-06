import { Money } from '../value-objects/money.vo';
import { Score } from '../value-objects/score.vo';

export interface JobOfferProps {
  externalId: string;
  title: string;
  description: string;
  budget: Money | null;
  category: string;
  url: string;
  postedAt: Date;
}

export interface AnalysisResult {
  extractedRequirements: string[];
  matchedSkills: string[];
  budgetAssessment: string;
  score: Score;
  summary: string;
}

export class JobOffer {
  public readonly externalId: string;
  public readonly title: string;
  public readonly description: string;
  public readonly budget: Money | null;
  public readonly category: string;
  public readonly url: string;
  public readonly postedAt: Date;

  private _analysis: AnalysisResult | null = null;
  private _notified = false;

  constructor(props: JobOfferProps) {
    this.externalId = props.externalId;
    this.title = this.sanitize(props.title);
    this.description = this.sanitize(props.description);
    this.budget = props.budget;
    this.category = this.sanitize(props.category);
    this.url = props.url;
    this.postedAt = props.postedAt;
  }

  get analysis(): AnalysisResult | null {
    return this._analysis;
  }

  get isNotified(): boolean {
    return this._notified;
  }

  attachAnalysis(result: AnalysisResult): void {
    this._analysis = result;
  }

  markAsNotified(): void {
    this._notified = true;
  }

  isWorthNotifying(scoreThreshold: number): boolean {
    if (!this._analysis) return false;
    return this._analysis.score.isWorthNotifying(scoreThreshold);
  }

  private sanitize(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
}
