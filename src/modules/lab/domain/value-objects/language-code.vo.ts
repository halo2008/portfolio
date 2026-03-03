/**
 * Supported language codes for the Lab environment.
 * Explaining: Strict union type ensures only PL/EN are used throughout the system.
 */
export type SupportedLanguage = 'pl' | 'en';

/**
 * LanguageCode Value Object
 * Explaining: Encapsulates language code validation and provides bilingual helpers.
 */
export class LanguageCode {
    private static readonly SUPPORTED_LANGUAGES: SupportedLanguage[] = ['pl', 'en'];

    private constructor(private readonly value: SupportedLanguage) {}

    /**
     * Factory method with validation.
     * Only 'pl' and 'en' are supported.
     */
    static create(code: string): LanguageCode {
        const normalized = code?.toLowerCase().trim();
        if (!normalized) {
            // Default to English if not provided
            return new LanguageCode('en');
        }
        if (!LanguageCode.SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
            throw new Error(`Unsupported language code: ${code}. Supported: pl, en`);
        }
        return new LanguageCode(normalized as SupportedLanguage);
    }

    /**
     * Detect language from browser locale string.
     * Defaults to English if Polish is not detected.
     */
    static fromLocale(locale: string): LanguageCode {
        if (!locale) return new LanguageCode('en');
        const normalized = locale.toLowerCase();
        // Check for Polish locale patterns (pl, pl-PL, pl_PL)
        if (normalized.startsWith('pl')) {
            return new LanguageCode('pl');
        }
        return new LanguageCode('en');
    }

    toString(): SupportedLanguage {
        return this.value;
    }

    isPolish(): boolean {
        return this.value === 'pl';
    }

    isEnglish(): boolean {
        return this.value === 'en';
    }

    equals(other: LanguageCode): boolean {
        return this.value === other.value;
    }
}
