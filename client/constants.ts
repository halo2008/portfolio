import { PortfolioContent } from './types';

const IMAGES = {
  portrait: "/portrait.jpg",
  factory: "https://image.pollinations.ai/prompt/Heavy%20Industry%20Factory%20Floor%20Sparks%20Welding%20Robot%20Arm%20IoT%20Sensors%20Data%20Cables%20Connecting%20To%20Cloud%20Hologram%20Overlay?width=1024&height=1024&nologo=true",
  projectA: "https://image.pollinations.ai/prompt/Industrial%20Logistics%20Truck%20Weighing%20Station%20Night%20Cyberpunk%20Neon%20Lights%20Rain%20Reflections%20High%20Tech%20Overlay%20UI%20Data%20Visualization%204k%20realistic?width=1024&height=1024&nologo=true",
  projectB: "https://image.pollinations.ai/prompt/Artificial%20Intelligence%20Brain%20Neural%20Network%20Glowing%20Synapses%20Data%20Flow%20Digital%20Art%20Dark%20Background%20Blue%20Purple%20Neon?width=1024&height=1024&nologo=true",
  projectC: "https://image.pollinations.ai/prompt/Kubernetes%20Cluster%20Abstract%203D%20Visualization%20Server%20Racks%20Glowing%20Blue%20Neon%20Data%20Streams%20Isometric%20View%20Tech%20Background?width=1024&height=1024&nologo=true",
};

const COMMON_TECH = {
  cloud: ["GCP", "Terraform", "Kubernetes (GKE)", "Docker", "Helm"],
  sec: ["HashiCorp Vault", "Zitadel", "Kyverno", "GitHub Actions", "ArgoCD"],
  ai: ["Python", "PyTorch (Darts/TFT)", "LangChain", "Milvus", "PostgreSQL", "Vertex AI"],
  fullstack: ["NestJS", "TypeScript", "React", "Android (Kotlin)", "gRPC"]
};

export const TRANSLATIONS: Record<'en' | 'pl', PortfolioContent> = {
  en: {
    name: "Konrad Sędkowski",
    title: "AI Infrastructure & DevOps Engineer",
    availability: "🟢 Open for B2B Contracts & Consulting",
    hero: {
      headline: "Bridging the Gap Between Legacy Hardware, Cloud, and AI.",
      subheadline: "I help companies migrate from chaotic setups to scalable Kubernetes (GKE) and Cloud Run. I build cost-effective RAG pipelines optimized for CPU inference and integrate industrial IoT hardware with modern ERPs.",
      tags: ["MLOps", "AI Engineer", "Cloud Architect"],
      cta: "View Case Studies",
      ctaSecondary: "Services / Collaboration",
      profileImage: IMAGES.portrait
    },
    philosophy: {
      title: "Not Just a DevOps. A Problem Solver.",
      description: "Most engineers specialize in one narrow field. I thrive on the full spectrum. I turn 'it works on my machine' into 'it works at scale'. From soldering cables to deploying LLMs on Kubernetes, I deliver end-to-end solutions.",
      differentiatorTitle: "AI-Augmented Cloud Engineering",
      differentiator: "I don't just deploy infrastructure. I design intelligent systems that learn, adapt, and scale autonomously (e.g., Autoscaling based on AI predictions).",
      image: IMAGES.factory
    },
    projects: {
      title: "Case Studies & Deployments",
      labels: { challenge: "The Challenge", solution: "The Solution", result: "The Result" },
      items: [
        {
          id: '1',
          title: "High-Accuracy Invoice Processing Pipeline (RAG & Vision AI)",
          subtitle: "RAG • MLOps • Optimization",
          challenge: "Standard OCR tools failed to extract structured data from multi-format vendor invoices, leading to 75% manual intervention. The business required a solution that 'understands' layout context without expensive GPU instances.",
          solution: "I engineered a hybrid pipeline: 1) Vision-First Approach: Replaced raw text extraction with YOLO v8 for document layout analysis. 2) Contextual RAG: Implemented Dynamic Prompting stored in Pgvector to identify vendors. 3) Hardware Optimization: Optimized Gemma 7b quantization to run efficiently on Intel Xeon (AVX-512) CPUs, eliminating dedicated GPUs.",
          tech: ["Python", "YOLO v8", "PgVector", "Gemma 7b (Quantized)", "Docker"],
          result: "Accuracy increased from 75% to 95%+. Processing time dropped from minutes to seconds per document. Cloud costs reduced by 60%.",
          iconName: 'Brain',
          image: IMAGES.projectB
        },
        {
          id: '2',
          title: "Connecting Legacy Industrial Hardware (IoT) to Cloud ERP",
          subtitle: "Industrial IoT • Edge Computing",
          challenge: "A manufacturing plant needed real-time data from 20-year-old heavy-duty truck scales and ANPR cameras. The hardware used archaic protocols (RS232) and was air-gapped from the modern web-based ERP.",
          solution: "I designed an Edge-to-Cloud bridge: 1) Edge Gateway: Developed a custom Node.js/Python middleware running on local edge devices to buffer and parse binary RS232 streams into JSON. 2) Video Pipeline: Integrated FFmpeg transcoding to stream 4K ANPR feeds (H.265 to H.264). 3) Secure Transport: Established a secure tunnel for bi-directional communication.",
          tech: ["Node.js", "Python", "RS232/Modbus", "FFmpeg", "WebSockets"],
          result: "Fully automated weighing process. Removed manual data entry errors and enabled real-time inventory tracking.",
          iconName: 'Wifi',
          image: IMAGES.projectA
        },
        {
          id: '3',
          title: "Monolith to Microservices: Zero-Downtime Migration to GKE",
          subtitle: "DevSecOps • Kubernetes Transformation",
          challenge: "Critical ERP systems were hosted on a single-point-of-failure VPS with manual deployment scripts. Backups caused system freezes, and secret management was non-existent.",
          solution: "I orchestrated a complete infrastructure overhaul: 1) IaC: Codified the entire stack using Terraform. 2) GKE Autopilot: Migrated workloads to a highly available cluster. 3) Security First: Implemented HashiCorp Vault interactions and Kyverno policies. 4) Observability: Deployed Prometheus/Grafana/Loki stack.",
          tech: ["GCP (GKE)", "Terraform", "HashiCorp Vault", "Kyverno", "GitLab CI"],
          result: "99.9% uptime, automated CI/CD pipelines, and recovery time (RTO) reduced from hours to minutes.",
          iconName: 'Cloud',
          image: IMAGES.projectC
        }
      ]
    },
    services: {
      title: "Consulting & Implementation Services",
      items: [
        {
          title: "MVP Development with AI",
          description: "Rapid prototyping of AI-driven applications (Chatbots, RAG, Automation). I take you from 'idea' to 'deployed on Cloud Run' in weeks, not months.",
          iconName: "Rocket"
        },
        {
          title: "Cloud Cost Optimization",
          description: "Analysis of your AWS/GCP bills. I optimize Kubernetes clusters, spot instances, and serverless setups to stop burning money.",
          iconName: "Shield"
        },
        {
          title: "Legacy System Integration",
          description: "I build APIs and secure bridges for hardware or software that 'doesn't have an API'.",
          iconName: "Server"
        }
      ]
    },
    techStack: {
      title: "The Arsenal",
      items: [
        { category: "Cloud Infrastructure", items: COMMON_TECH.cloud, iconName: 'Cloud' },
        { category: "Security & DevOps", items: COMMON_TECH.sec, iconName: 'Lock' },
        { category: "AI & Data Engineering", items: COMMON_TECH.ai, iconName: 'Brain' },
        { category: "Full-Stack & Mobile", items: COMMON_TECH.fullstack, iconName: 'Code' }
      ]
    },
    contact: {
      cta: "Ready to scale your business? Let's talk.",
      sub: "Available for complex infrastructure migrations and AI system design.",
      buttons: { cv: "Download CV (PDF)", linkedin: "Contact on LinkedIn", email: "Email Me" },
      linkedinUrl: "https://linkedin.com/in/placeholder",
      emailUrl: "konrad@example.com"
    },
    aiChat: {
      trigger: "Ask AI About Me",
      title: "Konrad's Assistant",
      placeholder: "Ask about RAG, Kubernetes, or IoT...",
      initialMessage: "Hi! I'm Konrad's AI Assistant. Ask me about my case studies, tech stack, or experience.",
      thinking: "Thinking...",
      error: "I encountered an error.",
      status: "Online (Gemini 2.5)"
    },
    nav: { home: "Home", projects: "Case Studies", resume: "About / Resume", services: "Services", contact: "Contact" },
    footer: "Konrad Sędkowski. Engineered with React, NestJS, and Gemini AI on Cloud Run."
  },
  pl: {
    name: "Konrad Sędkowski",
    title: "Inżynier AI Infrastructure & DevOps",
    availability: "🟢 Otwarty na kontrakty B2B i konsultacje",
    hero: {
      headline: "Łączę Legacy Hardware, Chmurę i Nowoczesne AI.",
      subheadline: "Pomagam firmom migrować z chaotycznych VPS-ów na skalowalne środowiska Kubernetes (GKE) i Cloud Run. Buduję efektywne kosztowo systemy RAG (CPU inference) i integruję przemysłowe IoT z nowoczesnymi systemami ERP.",
      tags: ["MLOps", "Inżynier AI", "Architekt Chmury"],
      cta: "Zobacz Case Studies",
      ctaSecondary: "Usługi / Współpraca",
      profileImage: IMAGES.portrait
    },
    philosophy: {
      title: "Nie Tylko DevOps. Problem Solver.",
      description: "Większość inżynierów specjalizuje się w jednej wąskiej dziedzinie. Ja działam w pełnym spektrum. Potrafię przylutować kabel do wagi przemysłowej, napisać sterownik do odczytu danych, zbudować bezpieczną platformę chmurową do ich przetwarzania i wytrenować model AI przewidujący popyt na podstawie tych danych.",
      differentiatorTitle: "Efektywność Wspierana przez AI",
      differentiator: "Nie tylko wdrażam infrastrukturę. Projektuję inteligentne systemy, które uczą się, adaptują i skalują autonomicznie.",
      image: IMAGES.factory
    },
    projects: {
      title: "Case Studies & Wdrożenia",
      labels: { challenge: "Wyzwanie", solution: "Rozwiązanie", result: "Wynik" },
      items: [
        {
          id: '1',
          title: "Inteligentne Przetwarzanie Dokumentów (OCR & RAG)",
          subtitle: "RAG • MLOps • Optymalizacja",
          challenge: "Standardowe narzędzia OCR nie radziły sobie z fakturami o zmiennym formacie, co wymuszało 75% ręcznej ingerencji. Biznes potrzebował rozwiązania 'rozumiejącego' kontekst bez drogich instancji GPU.",
          solution: "Zbudowałem hybrydowy pipeline: 1) Vision-First: Zastąpiłem surowy OCR modelem YOLO v8 do analizy układu. 2) Kontekstowy RAG: Dynamiczne prompty przechowywane w Pgvector identyfikowały dostawców. 3) Optymalizacja Sprzętowa: Gemma 7b skwantyzowana pod procesory Intel Xeon (AVX-512), eliminująca potrzebę GPU.",
          tech: ["Python", "YOLO v8", "PgVector", "Gemma 7b", "Docker"],
          result: "Wzrost dokładności z 75% do 95%+. Czas przetwarzania spadł z minut do sekund. Koszty chmury zredukowane o 60%.",
          iconName: 'Brain',
          image: IMAGES.projectB
        },
        {
          id: '2',
          title: "Integracja Legacy Industrial IoT z Chmurą",
          subtitle: "Industrial IoT • Edge Computing",
          challenge: "Fabryka potrzebowała danych w czasie rzeczywistym z 20-letnich wag ciężarowych i kamer ANPR. Sprzęt używał archaicznych protokołów (RS232) i był odcięty od sieci.",
          solution: "Zaprojektowałem most Edge-to-Cloud: 1) Edge Gateway: Custom middleware (Node.js/Python) na urządzeniach brzegowych do buforowania RS232. 2) Video Pipeline: Transkodowanie FFmpeg strumieni 4K ANPR. 3) Bezpieczny Tunel do dwukierunkowej komunikacji z chmurą.",
          tech: ["Node.js", "Python", "RS232/Modbus", "FFmpeg", "WebSockets"],
          result: "Pełna automatyzacja procesu ważenia. Eliminacja błędów ręcznych i śledzenie zapasów w czasie rzeczywistym.",
          iconName: 'Wifi',
          image: IMAGES.projectA
        },
        {
          id: '3',
          title: "Monolit do Mikroserwisów: Migracja na GKE",
          subtitle: "DevSecOps • Transformacja Kubernetes",
          challenge: "Krytyczne systemy ERP stały na pojedynczym VPS z ręcznymi skryptami wdrażania. Brak zarządzania sekretami i częste zamrożenia przy backupach.",
          solution: "Przeprowadziłem całkowitą przebudowę infrastruktury: 1) IaC: Terraform dla całego stacku. 2) GKE Autopilot: Migracja na klaster wysokiej dostępności. 3) Security First: HashiCorp Vault i polityki Kyverno. 4) Observability: Pełny stack Prometheus/Grafana/Loki.",
          tech: ["GCP (GKE)", "Terraform", "HashiCorp Vault", "Kyverno", "GitLab CI"],
          result: "99.9% uptime, automatyczne CI/CD, czas przywracania (RTO) zredukowany z godzin do minut.",
          iconName: 'Cloud',
          image: IMAGES.projectC
        }
      ]
    },
    services: {
      title: "Usługi Konsultingowe i Wdrożeniowe",
      items: [
        {
          title: "Budowa MVP z AI",
          description: "Szybkie prototypowanie aplikacji opartych na AI (Chatboty, RAG, Automatyzacja). Zabieram Cię od 'pomysłu' do 'wdrożenia na Cloud Run' w kilka tygodni.",
          iconName: "Rocket"
        },
        {
          title: "Optymalizacja Kosztów Chmury",
          description: "Analiza rachunków AWS/GCP. Optymalizuję klastry Kubernetes i konfiguracje Serverless, aby przestać przepalać budżet.",
          iconName: "Shield"
        },
        {
          title: "Integracja Systemów Legacy",
          description: "Buduję API i bezpieczne mosty dla sprzętu lub oprogramowania, które 'nie posiada API'.",
          iconName: "Server"
        }
      ]
    },
    techStack: {
      title: "Arsenał Technologiczny",
      items: [
        { category: "Infrastruktura Chmurowa", items: COMMON_TECH.cloud, iconName: 'Cloud' },
        { category: "Bezpieczeństwo i DevOps", items: COMMON_TECH.sec, iconName: 'Lock' },
        { category: "Inżynieria AI i Danych", items: COMMON_TECH.ai, iconName: 'Brain' },
        { category: "Full-Stack i Mobile", items: COMMON_TECH.fullstack, iconName: 'Code' }
      ]
    },
    contact: {
      cta: "Gotowy na skalowanie swojego biznesu? Porozmawiajmy.",
      sub: "Dostępny do złożonych migracji infrastruktury i projektowania systemów AI.",
      buttons: { cv: "Pobierz CV (PDF)", linkedin: "Kontakt na LinkedIn", email: "Napisz Email" },
      linkedinUrl: "https://linkedin.com/in/placeholder",
      emailUrl: "konrad@example.com"
    },
    aiChat: {
      trigger: "Zapytaj AI o mnie",
      title: "Asystent Konrada",
      placeholder: "Zapytaj o RAG, Kubernetes lub IoT...",
      initialMessage: "Cześć! Jestem Asystentem AI Konrada. Zapytaj mnie o Case Studies, technologie lub doświadczenie.",
      thinking: "Myślę...",
      error: "Wystąpił błąd.",
      status: "Online (Gemini 2.5)"
    },
    nav: { home: "Home", projects: "Case Studies", resume: "O mnie / Resume", services: "Usługi", contact: "Kontakt" },
    footer: "Konrad Sędkowski. Zbudowano w React, NestJS i Gemini AI na Cloud Run."
  }
};

// We export English by default for the AI system prompt to contain raw data, 
// but we add an instruction to speak the user's language.
const DATA = TRANSLATIONS.en;

export const SYSTEM_INSTRUCTION = `
You are "Konrad's AI Assistant", a helpful agent on the portfolio website of Konrad Sędkowski.
Your goal is to answer questions about Konrad's experience, skills, and projects in a professional, concise manner suitable for recruiters and B2B clients.

IMPORTANT LANGUAGE INSTRUCTION:
- If the user asks in Polish, reply in Polish.
- If the user asks in English, reply in English.
- If the user is viewing the Polish version of the site (implied by context), prefer Polish.

Context Data:
Bio: ${DATA.hero.subheadline}
Philosophy: ${DATA.philosophy.description}
Key Differentiator: ${DATA.philosophy.differentiator}
Availability: ${DATA.availability}

Case Studies (Projects):
${DATA.projects.items.map(p => `### ${p.title} (${p.subtitle})
Challenge: ${p.challenge}
Solution: ${p.solution}
Tech: ${p.tech.join(', ')}
Result: ${p.result}`).join('\n\n')}

Services:
${DATA.services.items.map(s => `- ${s.title}: ${s.description}`).join('\n')}

Tech Stack:
${DATA.techStack.items.map(t => `- ${t.category}: ${t.items.join(', ')}`).join('\n')}

Contact:
Users can contact Konrad via LinkedIn or Email.
`;