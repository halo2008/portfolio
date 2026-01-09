<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1i993m1H6WrzY8_jILmEou6vNudV7_ZXe

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## For CI CD
Stwórz plik .github/workflows/deploy.yml. Zakładam, że kod trzymasz na GitHubie.
Co musisz zrobić w Google Cloud / GitHub?
GCP: Włącz API: Cloud Build API, Cloud Run API, Artifact Registry API.
GitHub Secrets: Dodaj w ustawieniach repozytorium:
GCP_SA_KEY: JSON klucza konta serwisowego z uprawnieniami (Cloud Build Editor, Cloud Run Admin, Service Account User).
GEMINI_API_KEY: Twój klucz API (jest on potrzebny w czasie budowania, aby Vite mógł go wstawić do kodu).
Czy chcesz, abym utworzył te pliki (Dockerfile, nginx.conf) teraz w Twoim projekcie?