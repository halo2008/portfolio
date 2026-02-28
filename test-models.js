const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function check() {
  const models = await ai.models.list();
  for await (const model of models) {
    if (model.name.includes('embedding') || model.name.includes('flash')) {
      console.log(model.name, model.supportedGenerationMethods);
    }
  }
}
check().catch(console.error);
