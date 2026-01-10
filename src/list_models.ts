
import { GoogleGenAI } from '@google/genai';

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set. Please run with GEMINI_API_KEY=... npx ts-node src/list_models.ts');
        process.exit(1);
    }

    const genAI = new GoogleGenAI({ apiKey });
    try {
        console.log('Fetching available models...');
        const response = await genAI.models.list();

        let models: any[] = [];
        if ('pageInternal' in response && Array.isArray((response as any).pageInternal)) {
            models = (response as any).pageInternal;
        } else if ('models' in response && Array.isArray((response as any).models)) {
            models = (response as any).models;
        } else {
            // Try to find any array property
            for (const key in response) {
                if (Array.isArray((response as any)[key])) {
                    models = (response as any)[key];
                    break;
                }
            }
        }

        console.log(`Found ${models.length} models.`);
        models.forEach((model: any) => {
            if (model.name.includes('gemini') || model.name.includes('embedding')) {
                console.log(`- ${model.name}`);
                console.log(`  Display Name: ${model.displayName}`);
                console.log('---');
            }
        });
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
