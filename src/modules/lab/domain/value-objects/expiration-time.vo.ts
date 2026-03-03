/**
 * ExpirationTime Value Object
 * Explaining: Ensures expiration dates are valid and in the future at creation time.
 */
export class ExpirationTime {
    private constructor(private readonly value: Date) {}

    /**
     * Factory method that creates an expiration time from a Date.
     * Validates that the date is valid.
     */
    static create(expiresAt: Date): ExpirationTime {
        if (!(expiresAt instanceof Date) || isNaN(expiresAt.getTime())) {
            throw new Error('ExpirationTime must be a valid Date');
        }
        return new ExpirationTime(expiresAt);
    }

    /**
     * Creates an expiration time N hours from now.
     * Default is 24 hours for ephemeral demo users.
     */
    static fromNow(hours: number = 24): ExpirationTime {
        if (hours <= 0 || hours > 168) {
            throw new Error('Expiration hours must be between 1 and 168 (1 week)');
        }
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
        return new ExpirationTime(expiresAt);
    }

    /**
     * Check if this expiration time has passed.
     */
    isExpired(referenceTime: Date = new Date()): boolean {
        return this.value.getTime() < referenceTime.getTime();
    }

    toDate(): Date {
        return new Date(this.value);
    }

    toISOString(): string {
        return this.value.toISOString();
    }

    equals(other: ExpirationTime): boolean {
        return this.value.getTime() === other.value.getTime();
    }
}
