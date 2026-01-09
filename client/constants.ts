import { PortfolioContent } from './types';

const IMAGES = {
  portrait: "/portrait.jpg",
  factory: "https://image.pollinations.ai/prompt/Heavy%20Industry%20Factory%20Floor%20Sparks%20Welding%20Robot%20Arm%20IoT%20Sensors%20Data%20Cables%20Connecting%20To%20Cloud%20Hologram%20Overlay?width=1024&height=1024&nologo=true",
  projectA: "https://image.pollinations.ai/prompt/Industrial%20Logistics%20Truck%20Weighing%20Station%20Night%20Cyberpunk%20Neon%20Lights%20Rain%20Reflections%20High%20Tech%20Overlay%20UI%20Data%20Visualization%204k%20realistic?width=1024&height=1024&nologo=true",
  projectB: "https://image.pollinations.ai/prompt/Artificial%20Intelligence%20Brain%20Neural%20Network%20Glowing%20Synapses%20Data%20Flow%20Digital%20Art%20Dark%20Background%20Blue%20Purple%20Neon?width=1024&height=1024&nologo=true",
  projectC: "https://image.pollinations.ai/prompt/Kubernetes%20Cluster%20Abstract%203D%20Visualization%20Server%20Racks%20Glowing%20Blue%20Neon%20Data%20Streams%20Isometric%20View%20Tech%20Background?width=1024&height=1024&nologo=true",
  projectD: "https://image.pollinations.ai/prompt/Smartphone%20App%20Dashboard%20Hand%20Holding%20Phone%20Warehouse%20Background%20Augmented%20Reality%20Sales%20Data%20Hologram%20Futuristic%20UI%20Dark%20Mode?width=1024&height=1024&nologo=true",
  projectE: "https://image.pollinations.ai/prompt/Warehouse%20Worker%20Scanning%20Barcode%20With%20Smartphone%20Close%20Up%20Thermal%20Printer%20Bluetooth%20Blue%20Laser%20Scan%20Line%20Industrial%20Lighting?width=1024&height=1024&nologo=true",
  projectF: "https://image.pollinations.ai/prompt/Futuristic%20Holographic%20Data%20Visualization%20Supply%20Chain%20Forecast%20Glowing%20Neon%20Trend%20Lines%20Dark%20Glass%20Dashboard%20Industrial%20Background%20Prediction%20Confidence%20High%20Tech%20UI?width=1024&height=1024&nologo=true"
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
      headline: "I Connect the Physical World with the AI Cloud.",
      subheadline: "I build scalable AI systems and integrate hardware with the cloud. I turn chaos into working MVPs.",
      tags: ["Cloud Architect", "Industrial IoT", "AI Engineer"],
      cta: "View Projects",
      ctaSecondary: "Services / Collaboration",
      profileImage: IMAGES.portrait
    },
    philosophy: {
      title: "Not Just a DevOps. A Problem Solver.",
      description: "Most engineers specialize in one narrow field. I thrive on the full spectrum. I can solder a cable to a factory scale, write the driver to read its data, build a secure Cloud Platform to process it, and train an AI model to predict future demand based on that data.",
      differentiatorTitle: "AI-Augmented Efficiency",
      differentiator: "I leverage modern AI tools to deliver enterprise-grade MVPs 10x faster than traditional teams.",
      image: IMAGES.factory
    },
    projects: {
      title: "Case Studies",
      labels: { challenge: "Challenge", solution: "Solution", result: "Result" },
      items: [
        {
          id: 'F',
          title: "AI Supply Chain Oracle",
          subtitle: "Predictive Analytics",
          challenge: "Inventory management is a gamble without data. Purchasing decisions relied on gut feeling, leading to overstock or shortages.",
          solution: "Built a State-of-the-Art forecasting system using Temporal Fusion Transformers (TFT) via PyTorch & Darts. It analyzes historical ERP data, seasonality, and economic indicators, utilizing Hidden Markov Models (HMM) for market state detection.",
          tech: ["Python", "PyTorch", "Darts (TFT)", "MSSQL", "Matplotlib"],
          result: "Visual forecasts with confidence intervals (10%/50%/90%) allowing for data-driven purchasing decisions.",
          iconName: 'Brain',
          image: IMAGES.projectF
        },
        {
          id: 'A',
          title: "The Autonomous Logistics System",
          subtitle: "IoT + Cloud",
          challenge: "Manual weighing and tracking of steel shipments caused delays and errors.",
          solution: "Built an Edge-to-Cloud system. Integrated legacy RS232 industrial scales and ANPR (License Plate Recognition) cameras.",
          tech: ["Node.js", "WebSockets", "Kubernetes", "PostgreSQL", "Video Streaming"],
          result: "100% automated entry/exit logging, real-time video preview on low-end hardware.",
          iconName: 'Server',
          image: IMAGES.projectA
        },
        {
          id: 'E',
          title: "Custom Mobile Warehousing",
          subtitle: "Android + Bluetooth CPCL",
          challenge: "Expensive proprietary handhelds locked operations to specific vendors and increased costs.",
          solution: "Engineered a rapid scan-to-print workflow combining camera-based barcode recognition with a custom CPCL communication layer via Bluetooth RFCOMM to control legacy Zebra printers directly.",
          tech: ["Android", "Kotlin", "Bluetooth RFCOMM", "CPCL", "Zebra"],
          result: "Decoupled software from hardware, reducing device costs by 80% using budget smartphones.",
          iconName: 'Smartphone',
          image: IMAGES.projectE
        },
        {
          id: 'B',
          title: "The AI Sales Agent",
          subtitle: "GenAI + RAG",
          challenge: "Sales team wasted hours calculating quotes and writing emails.",
          solution: "Created an intelligent RAG system. It retrieves client history from Milvus (Vector DB) and uses the Gemma 3 LLM to calculate pricing and generate personalized sales emails with one click.",
          tech: ["Python", "LangChain", "Milvus", "Gemma 3", "NestJS"],
          result: "Drastic reduction in time-to-quote.",
          iconName: 'Bot',
          image: IMAGES.projectB
        },
        {
          id: 'C',
          title: "Secure Cloud Platform",
          subtitle: "DevSecOps",
          challenge: "Migrating critical ERP infrastructure to the cloud with zero trust security.",
          solution: "Designed a GCP architecture using Terraform. Implemented GKE with Workload Identity and HashiCorp Vault for secret management.",
          tech: ["GCP", "Terraform", "Kubernetes", "Vault", "External Secrets"],
          result: "Enterprise-grade security and scalability with optimized costs.",
          iconName: 'Shield',
          image: IMAGES.projectC
        },
        {
          id: 'D',
          title: "Mobile Sales Force Automation",
          subtitle: "Native Android",
          solution: "Native Android App (Kotlin) for 60+ sales reps with Firebase synchronization and \"Click-to-Call\" integration from the ERP.",
          challenge: "Field sales data was disconnected from the central ERP.",
          tech: ["Android (Kotlin)", "Firebase", "REST API", "Offline-First"],
          result: "Real-time synchronization of 60+ field agents.",
          iconName: 'Smartphone',
          image: IMAGES.projectD
        }
      ]
    },
    services: {
      title: "Services & Collaboration",
      items: [
        {
          title: "AI/DevOps Consultation",
          description: "Having trouble deploying a model? I'll help you fix it in an hour.",
          iconName: "Brain"
        },
        {
          title: "MVP Development",
          description: "Have an idea for a SaaS? I'll build the backend and infrastructure.",
          iconName: "Rocket"
        },
        {
          title: "IoT Integrations",
          description: "I'll connect your machines to the network.",
          iconName: "Wifi"
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
      cta: "Ready to automate your business? Let's build something impossible.",
      sub: "Available for complex infrastructure migrations and AI system design.",
      buttons: { cv: "Download CV (PDF)", linkedin: "Contact on LinkedIn", email: "Email Me" },
      linkedinUrl: "https://linkedin.com/in/placeholder",
      emailUrl: "konrad@example.com"
    },
    aiChat: {
      trigger: "Ask AI About Me",
      title: "Konrad's Assistant",
      placeholder: "Ask about logistics, IoT, or specific tech...",
      initialMessage: "Hi! I'm Konrad's AI Assistant. Ask me about his projects, tech stack, or experience.",
      thinking: "Thinking...",
      error: "I encountered an error.",
      status: "Online (Gemini 2.5)"
    },
    nav: { home: "Home", projects: "Case Studies", resume: "Resume / About", services: "Services", contact: "Contact" },
    footer: "Konrad Sędkowski. Built with React, Tailwind, and Gemini AI."
  },
  pl: {
    name: "Konrad Sędkowski",
    title: "Inżynier AI Infrastructure & DevOps",
    availability: "🟢 Otwarty na kontrakty B2B i konsultacje",
    hero: {
      headline: "Łączę Świat Fizyczny z Chmurą AI.",
      subheadline: "Buduję skalowalne systemy AI i integruję hardware z chmurą. Zamieniam chaos w działające MVP.",
      tags: ["Architekt Chmury", "Przemysłowe IoT", "Inżynier AI"],
      cta: "Zobacz Projekty",
      ctaSecondary: "Współpraca / Usługi",
      profileImage: IMAGES.portrait
    },
    philosophy: {
      title: "Nie Tylko DevOps. Problem Solver.",
      description: "Większość inżynierów specjalizuje się w jednej wąskiej dziedzinie. Ja działam w pełnym spektrum. Potrafię przylutować kabel do wagi przemysłowej, napisać sterownik do odczytu danych, zbudować bezpieczną platformę chmurową do ich przetwarzania i wytrenować model AI przewidujący popyt na podstawie tych danych.",
      differentiatorTitle: "Efektywność Wspierana przez AI",
      differentiator: "Wykorzystuję nowoczesne narzędzia AI, aby dostarczać rozwiązania klasy enterprise 10x szybciej niż tradycyjne zespoły.",
      image: IMAGES.factory
    },
    projects: {
      title: "Case Studies",
      labels: { challenge: "Wyzwanie", solution: "Rozwiązanie", result: "Wynik" },
      items: [
        {
          id: 'F',
          title: "AI Supply Chain Oracle",
          subtitle: "Analityka Predykcyjna",
          challenge: "Zarządzanie zapasami bez danych to hazard. Decyzje zakupowe opierały się na intuicji, co prowadziło do nadstanów lub braków.",
          solution: "Zbudowałem system prognozowania State-of-the-Art wykorzystujący Temporal Fusion Transformers (TFT). Analizuje historię z ERP, sezonowość i wskaźniki ekonomiczne, używając Ukrytych Modeli Markowa do detekcji stanów rynku.",
          tech: ["Python", "PyTorch", "Darts (TFT)", "MSSQL", "Matplotlib"],
          result: "Wizualne prognozy z przedziałami ufności (10%/50%/90%) umożliwiające podejmowanie decyzji opartych na danych.",
          iconName: 'Brain',
          image: IMAGES.projectF
        },
        {
          id: 'A',
          title: "Autonomiczny System Logistyczny",
          subtitle: "IoT + Chmura",
          challenge: "Ręczne ważenie i śledzenie transportów stali powodowało opóźnienia i błędy.",
          solution: "Zbudowałem system Edge-to-Cloud. Zintegrowałem starsze wagi przemysłowe RS232 i kamery ANPR (Rozpoznawanie Tablic).",
          tech: ["Node.js", "WebSockets", "Kubernetes", "PostgreSQL", "Streaming Wideo"],
          result: "100% zautomatyzowanej rejestracji wjazdów/wyjazdów, podgląd wideo w czasie rzeczywistym.",
          iconName: 'Server',
          image: IMAGES.projectA
        },
        {
          id: 'E',
          title: "Mobilny System Magazynowy",
          subtitle: "Android + Bluetooth CPCL",
          challenge: "Drogie, dedykowane terminale uzależniały operacje od konkretnych dostawców sprzętu i zwiększały koszty.",
          solution: "Zaprojektowałem workflow 'Scan-to-Print' łączący rozpoznawanie kodów kamerą z autorską implementacją protokołu CPCL przez Bluetooth RFCOMM do bezpośredniego sterowania starszymi drukarkami Zebra.",
          tech: ["Android", "Kotlin", "Bluetooth RFCOMM", "CPCL", "Zebra"],
          result: "Uniezależnienie oprogramowania od sprzętu, redukcja kosztów urządzeń o 80% przy użyciu budżetowych smartfonów.",
          iconName: 'Smartphone',
          image: IMAGES.projectE
        },
        {
          id: 'B',
          title: "Agent Sprzedaży AI",
          subtitle: "GenAI + RAG",
          challenge: "Zespół sprzedaży tracił godziny na kalkulację ofert i pisanie e-maili.",
          solution: "Stworzyłem inteligentny system RAG. Pobiera historię klienta z Milvus (Vector DB) i używa modelu Gemma 3 do obliczania cen oraz generowania spersonalizowanych ofert jednym kliknięciem.",
          tech: ["Python", "LangChain", "Milvus", "Gemma 3", "NestJS"],
          result: "Drastyczna redukcja czasu przygotowania oferty.",
          iconName: 'Bot',
          image: IMAGES.projectB
        },
        {
          id: 'C',
          title: "Bezpieczna Platforma Chmurowa",
          subtitle: "DevSecOps",
          challenge: "Migracja krytycznej infrastruktury ERP do chmury z zachowaniem bezpieczeństwa Zero Trust.",
          solution: "Zaprojektowałem architekturę GCP przy użyciu Terraform. Wdrożyłem GKE z Workload Identity i HashiCorp Vault do zarządzania sekretami.",
          tech: ["GCP", "Terraform", "Kubernetes", "Vault", "External Secrets"],
          result: "Bezpieczeństwo i skalowalność klasy Enterprise przy zoptymalizowanych kosztach.",
          iconName: 'Shield',
          image: IMAGES.projectC
        },
        {
          id: 'D',
          title: "Automatyzacja Sprzedaży Mobilnej",
          subtitle: "Natywny Android",
          solution: "Natywna aplikacja Android (Kotlin) dla 60+ handlowców z synchronizacją Firebase i integracją \"Click-to-Call\" z systemem ERP.",
          challenge: "Dane sprzedażowe z terenu były odłączone od centralnego systemu ERP.",
          tech: ["Android (Kotlin)", "Firebase", "REST API", "Offline-First"],
          result: "Synchronizacja 60+ agentów terenowych w czasie rzeczywistym.",
          iconName: 'Smartphone',
          image: IMAGES.projectD
        }
      ]
    },
    services: {
      title: "Współpraca i Usługi",
      items: [
        {
          title: "Konsultacja AI/DevOps",
          description: "Masz problem z wdrożeniem modelu? Pomogę Ci w godzinę.",
          iconName: "Brain"
        },
        {
          title: "Budowa MVP",
          description: "Masz pomysł na SaaS? Zbuduję backend i infrastrukturę.",
          iconName: "Rocket"
        },
        {
          title: "Integracje IoT",
          description: "Podłączę Twoje maszyny do sieci.",
          iconName: "Wifi"
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
      cta: "Gotowy na automatyzację swojego biznesu? Zbudujmy coś niemożliwego.",
      sub: "Dostępny do złożonych migracji infrastruktury i projektowania systemów AI.",
      buttons: { cv: "Pobierz CV (PDF)", linkedin: "Kontakt na LinkedIn", email: "Napisz Email" },
      linkedinUrl: "https://linkedin.com/in/placeholder",
      emailUrl: "konrad@example.com"
    },
    aiChat: {
      trigger: "Zapytaj AI o mnie",
      title: "Asystent Konrada",
      placeholder: "Zapytaj o logistykę, IoT lub technologie...",
      initialMessage: "Cześć! Jestem Asystentem AI Konrada. Zapytaj mnie o jego projekty, technologie lub doświadczenie.",
      thinking: "Myślę...",
      error: "Wystąpił błąd.",
      status: "Online (Gemini 2.5)"
    },
    nav: { home: "Home", projects: "Case Studies", resume: "Resume / O mnie", services: "Współpraca", contact: "Kontakt" },
    footer: "Konrad Sędkowski. Zbudowano w React, Tailwind i Gemini AI."
  }
};

// We export English by default for the AI system prompt to contain raw data, 
// but we add an instruction to speak the user's language.
const DATA = TRANSLATIONS.en;

export const SYSTEM_INSTRUCTION = `
You are "Konrad's AI Assistant", a helpful agent on the portfolio website of Konrad Sędkowski.
Your goal is to answer questions about Konrad's experience, skills, and projects.

IMPORTANT LANGUAGE INSTRUCTION:
- If the user asks in Polish, reply in Polish.
- If the user asks in English, reply in English.
- If the user is viewing the Polish version of the site (implied by context), prefer Polish.

Context Data:
Bio: ${DATA.hero.subheadline}
Philosophy: ${DATA.philosophy.description}
Key Differentiator: ${DATA.philosophy.differentiator}
Availability: ${DATA.availability}

Projects (Case Studies):
${DATA.projects.items.map(p => `- ${p.title} (${p.subtitle}): ${p.solution} Tech: ${p.tech.join(', ')}. Result: ${p.result}`).join('\n')}

Services:
${DATA.services.items.map(s => `- ${s.title}: ${s.description}`).join('\n')}

Tech Stack:
${DATA.techStack.items.map(t => `- ${t.category}: ${t.items.join(', ')}`).join('\n')}

Contact:
Users can contact Konrad via LinkedIn or Email.
`;