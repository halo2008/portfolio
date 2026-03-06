export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (!currency || currency.length !== 3) throw new Error('Currency must be a 3-letter ISO code');
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}
