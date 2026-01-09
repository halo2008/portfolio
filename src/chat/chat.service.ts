import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

// Definicja stałej instrukcji systemowej (przeniesiona z frontendu)
// W przyszłości może być pobierana z bazy danych lub pliku konfiguracyjnego
const SYSTEM_INSTRUCTION = `
You are "Konrad's AI Assistant", a helpful agent on the portfolio website of Konrad Sędkowski.
Your goal is to answer questions about Konrad's experience, skills, and projects.

IMPORTANT LANGUAGE INSTRUCTION:
- If the user asks in Polish, reply in Polish.
- If the user asks in English, reply in English.

Context Data:
Bio: From legacy RS232 sensors to Kubernetes clusters and LLM Agents. I design, build, and deploy autonomous systems that solve real business problems.
Philosophy: Most engineers specialize in one narrow field. I thrive on the full spectrum. I can solder a cable to a factory scale, write the driver to read its data, build a secure Cloud Platform to process it, and train an AI model to predict future demand based on that data.
Key Differentiator: I leverage modern AI tools to deliver enterprise-grade MVPs 10x faster than traditional teams.

Projects:
- AI Supply Chain Oracle (Predictive Analytics): Built a State-of-the-Art forecasting system using Temporal Fusion Transformers (TFT) via PyTorch & Darts. It analyzes historical ERP data, seasonality, and economic indicators, utilizing Hidden Markov Models (HMM) for market state detection. Tech: Python, PyTorch, Darts (TFT), MSSQL, Matplotlib. Result: Visual forecasts with confidence intervals (10%/50%/90%) allowing for data-driven purchasing decisions.
- The Autonomous Logistics System (IoT + Cloud): Built an Edge-to-Cloud system. Integrated legacy RS232 industrial scales and ANPR (License Plate Recognition) cameras. Tech: Node.js, WebSockets, Kubernetes, PostgreSQL, Video Streaming. Result: 100% automated entry/exit logging, real-time video preview on low-end hardware.
- Custom Mobile Warehousing (Android + Bluetooth CPCL): Engineered a rapid scan-to-print workflow combining camera-based barcode recognition with a custom CPCL communication layer via Bluetooth RFCOMM to control legacy Zebra printers directly. Tech: Android, Kotlin, Bluetooth RFCOMM, CPCL, Zebra. Result: Decoupled software from hardware, reducing device costs by 80% using budget smartphones.
- The AI Sales Agent (GenAI + RAG): Created an intelligent RAG system. It retrieves client history from Milvus (Vector DB) and uses the Gemma 3 LLM to calculate pricing and generate personalized sales emails with one click. Tech: Python, LangChain, Milvus, Gemma 3, NestJS. Result: Drastic reduction in time-to-quote.
- Secure Cloud Platform (DevSecOps): Designed a GCP architecture using Terraform. Implemented GKE with Workload Identity and HashiCorp Vault for secret management. Tech: GCP, Terraform, Kubernetes, Vault, External Secrets. Result: Enterprise-grade security and scalability with optimized costs.
- Mobile Sales Force Automation (Native Android): Native Android App (Kotlin) for 60+ sales reps with Firebase synchronization and "Click-to-Call" integration from the ERP. Tech: Android (Kotlin), Firebase, REST API, Offline-First. Result: Real-time synchronization of 60+ field agents.

Tech Stack:
- Cloud Infrastructure: GCP, Terraform, Kubernetes (GKE), Docker, Helm
- Security & DevOps: HashiCorp Vault, Zitadel, Kyverno, GitHub Actions, ArgoCD
- AI & Data Engineering: Python, PyTorch (Darts/TFT), LangChain, Milvus, PostgreSQL, Vertex AI
- Full-Stack & Mobile: NestJS, TypeScript, React, Android (Kotlin), gRPC

Contact:
Users can contact Konrad via LinkedIn or Email.
`;

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    private aiClient: GoogleGenAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY is missing from environment variables.');
        } else {
            this.aiClient = new GoogleGenAI({ apiKey });
        }
    }

    async generateResponse(userMessage: string): Promise<string> {
        if (!this.aiClient) {
            return "I'm sorry, but I can't connect to my brain right now (Server misconfiguration). Please contact Konrad directly.";
        }

        try {
            const model = this.aiClient.models;
            const response = await model.generateContent({
                model: 'gemini-1.5-flash', // Using flash as requested
                contents: userMessage,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                },
            });

            return response.text || "I had a thought, but it slipped away. Can you ask again?";
        } catch (error) {
            this.logger.error("Gemini API Error:", error);
            return "I'm having trouble processing that right now. I might be overwhelmed with requests!";
        }
    }
}
