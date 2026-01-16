"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function Providers({ children }: { children: React.ReactNode }) {
    // Use env var or placeholder. Note: Next.js env vars need NEXT_PUBLIC_ prefix
    const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "PLACEHOLDER_KEY";

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={recaptchaKey}
            scriptProps={{
                async: false,
                defer: false,
                appendTo: "head",
                nonce: undefined,
            }}
        >
            {children}
        </GoogleReCaptchaProvider>
    );
}
