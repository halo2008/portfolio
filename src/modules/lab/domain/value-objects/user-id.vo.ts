export class UserId {
    private constructor(private readonly value: string) {}

    static create(uid: string): UserId {
        if (!uid || typeof uid !== 'string') {
            throw new Error('UserId cannot be empty');
        }
        if (uid.length < 10 || uid.length > 128) {
            throw new Error('UserId must be between 10 and 128 characters');
        }
        return new UserId(uid);
    }

    toString(): string {
        return this.value;
    }

    equals(other: UserId): boolean {
        return this.value === other.value;
    }
}
