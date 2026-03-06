export class Score {
  constructor(public readonly value: number) {
    if (value < 0 || value > 100) throw new Error('Score must be between 0 and 100');
  }

  isWorthNotifying(threshold: number): boolean {
    return this.value >= threshold;
  }
}
