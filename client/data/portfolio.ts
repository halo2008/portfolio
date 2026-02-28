import { PortfolioContent } from '../types';

// Vite handles this replacement.
// Note: import.meta.env.BASE_URL is '/cv/' in production.
const BASE = import.meta.env.BASE_URL;

const asset = (path: string) => {
    // If path starts with /, remove it to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${BASE}${cleanPath}`;
};

export const PORTFOLIO_DATA: Record<'en' | 'pl', PortfolioContent> = {
    en: {
        name: "Konrad Sędkowski",
        title: "DevOps Engineer & Full Stack Developer",
        availability: "🟢 Open for B2B contracts ",
        hero: {
            headline: "Bridging the Gap Between Industrial Hardware, Cloud Infrastructure, and Applied AI.",
            subheadline: "DevOps Engineer & Full Stack Developer with 10+ years of industrial background. I build systems that solve real physical and business problems.",
            tags: ["DevOps", "Kubernetes", "Industrial IoT"],
            cta: "View Case Studies",
            ctaSecondary: "Discuss Your Project",
            profileImage: asset("portrait.jpg")
        },
        philosophy: {
            title: "Engineering Pragmatism over Hype.",
            description: "I am not just a coder. With over a decade of experience in mechanics and production management, I understand that software is merely a tool to solve business problems. My path from repairing heavy machinery to architecting scalable Kubernetes clusters and training AI models gives me a unique advantage: I know how things work from the inside out.",
            differentiatorTitle: "Reliability & Automation",
            differentiator: "I don't build over-complicated solutions. I build reliable, secure, and automated systems that drive efficiency—whether it's on a production line or in a Google Cloud cluster.",
            image: asset("img/industrial.jpg")
        },
        projects: {
            title: "Featured Projects",
            labels: { challenge: "The Challenge", solution: "The Solution", result: "The Result" },
            items: [
                {
                    id: '1',
                    title: "Secure Multi-Tenant Container Platform on Google Cloud (GKE)",
                    subtitle: "DevSecOps • Kubernetes",
                    challenge: "Migrating an ERP system from a fragile VPS infrastructure (Single Point of Failure, backup issues) to a scalable cloud environment.",
                    solution: "Designed a GKE cluster from scratch. Implemented HashiCorp Vault for secrets, Calico for Default Deny network policies, and WAF at Ingress. Automated deployment with Helm and Bash scripts.",
                    tech: ["Kubernetes", "DevSecOps", "GKE", "Terraform", "Vault"],
                    result: "Eliminated downtime (Zero Downtime Deployments), fully automated Disaster Recovery, and ensured security compliance.",
                    iconName: 'Cloud',
                    image: asset("img/gke.jpg")
                },
                {
                    id: '2',
                    title: "Warehouse Logistics Automation: Integrating Industrial Scales & ANPR with ERP",
                    subtitle: "IoT • Hardware Integration",
                    challenge: "Truck scales communicating via obsolete RS232 protocol and 4K (H.265) cameras choking office PCs.",
                    solution: "Created middleware translating RS232 signals to REST API (regex parser). Deployed a video streaming server (FFmpeg) to transcode ANPR feeds in real-time.",
                    tech: ["IoT", "NestJS", "RS232", "Hardware", "FFmpeg"],
                    result: "Automatic weight logging upon license plate recognition. 100% digitalization of the goods receipt process.",
                    iconName: 'Wifi',
                    image: asset("img/anpr.jpg")
                },
                {
                    id: '3',
                    title: "Privacy-First AI Sales Assistant using Local LLMs & RAG Architecture",
                    subtitle: "GenAI • RAG • Privacy",
                    challenge: "Sales team needed AI support for emails, but company policy forbade sending client data to public clouds (ChatGPT).",
                    solution: "Deployed local models (Gemma/Phi) on own infrastructure (CPU optimized/AVX-512). RAG architecture retrieving client data from a vector database and injecting it into the prompt.",
                    tech: ["GenAI", "RAG", "Python", "Local LLM", "Privacy"],
                    result: "Secure generation of personalized offers without data leakage (GDPR compliant).",
                    iconName: 'Brain',
                    image: asset("img/ai.jpg")
                },
                {
                    id: '4',
                    title: "Custom Mobile CRM & Proprietary Printer Drivers for Warehouse Ops",
                    subtitle: "Mobile • Hardware",
                    challenge: "Lack of drivers for mobile Zebra printers for a specific labeling process and need to track sales calls.",
                    solution: "Reverse-engineered printer protocol and wrote a custom driver in CPCL. Created an Android app integrating call logs with the ERP system (Firebase bridge).",
                    tech: ["Android", "Kotlin", "Zebra", "CPCL", "Firebase"],
                    result: "Full control over steel labeling process and automatic reporting of sales department KPIs.",
                    iconName: 'Smartphone',
                    image: asset("img/mobile.jpg")
                },
                {
                    id: '5',
                    title: "Advanced Invoice Extraction System with 'Prompt-per-Vendor' Logic",
                    subtitle: "AI • Computer Vision",
                    challenge: "Low accuracy of classic OCR (Tesseract) with Polish invoices and LLM hallucinations when analyzing entire documents.",
                    solution: "Moved from OCR to raw PDF analysis via LLM. Developed a system of dynamic prompts selected based on the recognized Invoice Issuer NIP.",
                    tech: ["AI", "Computer Vision", "R&D", "Process Automation"],
                    result: "Data extraction accuracy increased from 75% to 95%.",
                    iconName: 'Brain',
                    image: asset("img/invoice.jpg")
                },
                {
                    id: '6',
                    title: "Scalable SaaS AI Chat Widget Architecture",
                    subtitle: "SaaS • Microservices",
                    challenge: "Creating a lightweight chat widget that clients can embed on any site, supporting chat history and human takeover.",
                    solution: "Microservices architecture based on Docker. Redis for session handling and caching, Nginx as reverse proxy, Postgres with Pgvector for bot knowledge base.",
                    tech: ["Microservices", "Docker", "Redis", "WebSockets"],
                    result: "Functional MVP supporting multiple tenants with data isolation.",
                    iconName: 'Bot',
                    image: asset("img/chat.jpg")
                }
            ]
        },
        timeline: {
            title: "Engineering Path",
            items: [
                {
                    id: "1",
                    period: "Aug 2025 - Present",
                    role: "DevOps Engineer",
                    company: "ULAMEX",
                    isCurrent: true,
                    description: "Designed and deployed a scalable, multi-tenant **GKE (Kubernetes)** platform from scratch.",
                    details: [
                        "**Security:** Implemented HashiCorp Vault, ModSecurity WAF, and Zero Trust Network Policies (Calico).",
                        "**Policy-as-Code:** Enforced cluster-wide security contexts using Kyverno.",
                        "**IAM:** Centralized access control with Zitadel (OIDC integration).",
                        "**Observability:** Built full monitoring stack (Prometheus, Grafana, Loki, Jaeger)."
                    ]
                },
                {
                    id: "2",
                    period: "Nov 2022 - Jul 2025",
                    role: "Full Stack Developer & AI Integrator",
                    company: "ULAMEX",
                    isCurrent: false,
                    description: "Lead development of an internal ERP system (NestJS/NextJS) integrating GenAI and Industrial IoT.",
                    details: [
                        "**Applied AI (RAG):** Built \"Smart Sales Assistant\" using Local LLMs (Gemma), Milvus Vector DB, and PostgreSQL.",
                        "**Mobile & Hardware:** Developed native Android CRM (Kotlin) and custom drivers (CPCL) for Zebra printers.",
                        "**IoT Integration:** Connected RS232 industrial scales and ANPR cameras (H.265 decoding) to the web ERP."
                    ]
                },
                {
                    id: "3",
                    period: "2011 - 2022",
                    role: "Industrial & IT Infrastructure Specialist",
                    company: "Previous Experience",
                    isCurrent: false,
                    description: "Over a decade of hands-on experience in manufacturing management and IT support. Background includes Production Management and maintaining electromechanical systems. *\"This industrial background allows me to bridge the gap between physical hardware and cloud software.\"*",
                    details: []
                }
            ]
        },
        services: {
            title: "Services",
            items: [
                {
                    title: "Kubernetes & Cloud Migration",
                    description: "Moving applications from VPS/On-prem to GKE. Security audits and IaC implementation.",
                    iconName: "Cloud"
                },
                {
                    title: "Custom IoT & Hardware Integration",
                    description: "Connecting unusual industrial devices (scales, cameras, readers) with the modern web.",
                    iconName: "Wifi"
                },
                {
                    title: "Local AI & RAG Implementation",
                    description: "Deploying private language models for companies concerned about data leakage.",
                    iconName: "Brain"
                }
            ]
        },
        businessValue: {
            title: "Strategic Business Value",
            items: [
                {
                    title: "High-Velocity Development",
                    description: "Leveraging AI-augmented engineering to deliver custom NextJS & Android solutions with record time-to-market without compromising code integrity.",
                    iconName: "Zap"
                },
                {
                    title: "Operational Continuity (SRE)",
                    description: "I translate industrial-grade reliability into 99.9% uptime for your cloud services, mitigating the risk of business-critical interruptions.",
                    iconName: "ShieldCheck"
                },
                {
                    title: "Scalable NestJS Ecosystems",
                    description: "Architecting modular, hexagonal backends that eliminate technical debt and ensure your investment is easy to maintain and expand for years.",
                    iconName: "Layers"
                },
                {
                    title: "AI Efficiency & RAG",
                    description: "Transforming your proprietary data into a competitive asset through private RAG systems that automate internal processes and reduce overhead.",
                    iconName: "TrendingUp"
                }
            ]
        },
        techStack: {
            title: "Tech Stack",
            items: [
                {
                    category: "Cloud & DevOps",
                    items: ["Kubernetes (GKE, On-premise)", "Docker", "Helm", "Terraform", "Bash Scripting"],
                    iconName: 'Cloud'
                },
                {
                    category: "Security & Observability",
                    items: ["HashiCorp Vault", "ModSecurity WAF", "Calico (Zero Trust)", "Prometheus", "Grafana", "Loki", "Jaeger"],
                    iconName: 'Lock'
                },
                {
                    category: "Backend & AI",
                    items: ["NestJS (TypeScript)", "Python", "Local LLM Inference (Ollama, Gemma)", "RAG Architecture", "Milvus/Pgvector", "PostgreSQL", "Redis"],
                    iconName: 'Brain'
                },
                {
                    category: "Mobile, IoT & Hardware",
                    items: ["Android (Kotlin)", "Jetpack Compose", "RS232", "CPCL (Zebra Printers)", "Modbus", "ANPR Cameras", "Digital Scales"],
                    iconName: 'Wifi'
                }
            ]
        },
        contact: {
            cta: "Ready to optimize your infrastructure?",
            sub: "Available for B2B contracts.",
            buttons: { cv: "Technical Portfolio (PDF)", linkedin: "Contact on LinkedIn", email: "Email Me" },
            linkedinUrl: "https://linkedin.com/in/placeholder",
            emailUrl: "konrad@example.com"
        },
        aiChat: {
            trigger: "Ask AI About Me",
            title: "Konrad's Assistant",
            placeholder: "Ask about Kubernetes, IoT, or AI...",
            initialMessage: "Hi! I'm Konrad's AI Assistant. Ask me about my projects or experience.",
            thinking: "Thinking...",
            error: "Error.",
            status: "Online"
        },
        nav: { home: "Home", projects: "Projects", resume: "About Me", services: "Services", contact: "Contact" },
        footer: "Open for B2B contracts.",
        landing: {
            hero: {
                headline: "Your Technical Documentation available in Slack in 3 seconds. No hallucinations.",
                subheadline: "Automate Knowledge Sharing. Secure RAG Architecture for Industrial & Tech teams.",
                cta: "Book a Demo",
                demoImage: asset("img/slack_demo.png")
            },
            howItWorks: {
                title: "How It Works",
                steps: [
                    { title: "Documents", description: "Your PDF/Confluence docs are ingested.", iconName: "FileText" },
                    { title: "Vector Systems", description: "Stored securely in Qdrant (On-premise or Cloud).", iconName: "Database" },
                    { title: "Gemini Reasoning", description: "Context is retrieved and processed by Gemini Pro.", iconName: "Brain" },
                    { title: "Slack Response", description: "Answer delivered instantly to your team.", iconName: "MessageSquare" }
                ]
            },
            security: {
                title: "Security First",
                description: "Infrastructure maintained by a Cloud & Security Engineer. Your data does not train public models.",
                features: ["Data Isolation", "GDPR Compliant", "No Public Model Training", "End-to-End Encryption"]
            },
            creator: {
                title: "Built by an Engineer, not an Agency",
                bio: "Hi, I'm Konrad. I design infrastructure for industry daily. I built this tool because I was tired of searching through 500-page PDFs. I prioritize reliability and security over hype.",
                name: "Konrad Sędkowski",
                role: "Senior DevOps & Founder",
                image: asset("portrait.jpg"),
                linkedin: "https://linkedin.com/in/placeholder"
            }
        }
    },
    pl: {
        name: "Konrad Sędkowski",
        title: "DevOps Engineer & Integrator IoT",
        availability: "🟢 Otwarty na kontrakty B2B",
        hero: {
            headline: "Łączę Industrial Hardware, Infrastrukturę Chmurową i AI.",
            subheadline: "DevOps Engineer & Full Stack Developer z 10+ letnim doświadczeniem w przemyśle. Buduję systemy rozwiązujące realne problemy fizyczne i biznesowe.",
            tags: ["DevOps", "Kubernetes", "Industrial IoT"],
            cta: "Zobacz Case Studies",
            ctaSecondary: "Omów Projekt",
            profileImage: asset("portrait.jpg")
        },

        philosophy: {
            title: "Inżynierski Pragmatyzm ponad Hype.",
            description: "Nie jestem tylko koderem. Z ponad dekadą doświadczenia w mechanice i zarządzaniu produkcją, rozumiem, że software to tylko narzędzie do rozwiązywania problemów biznesowych. Moja droga od naprawy ciężkich maszyn do architektury klastrów Kubernetes daje mi unikalną przewagę: wiem, jak rzeczy działają od środka.",
            differentiatorTitle: "Niezawodność i Automatyzacja",
            differentiator: "Nie buduję przekomplikowanych rozwiązań. Buduję niezawodne, bezpieczne i zautomatyzowane systemy, które napędzają efektywność – czy to na linii produkcyjnej, czy w klastrze Google Cloud.",
            image: asset("img/industrial.jpg")
        },
        projects: {
            title: "Wybrane Projekty",
            labels: { challenge: "Wyzwanie", solution: "Rozwiązanie", result: "Wynik" },
            items: [
                {
                    id: '1',
                    title: "Bezpieczna Platforma Kontenerowa Multi-Tenant na Google Cloud (GKE)",
                    subtitle: "DevSecOps • Kubernetes",
                    challenge: "Migracja systemu ERP z awaryjnej infrastruktury VPS (Single Point of Failure, problemy z backupami) do skalowalnego środowiska chmurowego.",
                    solution: "Zaprojektowanie klastra GKE od zera. Wdrożenie HashiCorp Vault do zarządzania sekretami, polityk sieciowych Calico (Default Deny) oraz WAF na warstwie Ingress. Automatyzacja wdrażania za pomocą skryptów Helm i Bash.",
                    tech: ["Kubernetes", "DevSecOps", "GKE", "Terraform", "Vault"],
                    result: "Eliminacja przestojów (Zero Downtime Deployments), pełna automatyzacja odzyskiwania (Disaster Recovery) i zgodność ze standardami bezpieczeństwa.",
                    iconName: 'Cloud',
                    image: asset("img/gke.jpg")
                },
                {
                    id: '2',
                    title: "Automatyzacja Logistyki Magazynowej: Integracja Wag Przemysłowych i ANPR z ERP",
                    subtitle: "IoT • Integracja Hardware",
                    challenge: "Wagi samochodowe komunikujące się przez przestarzały protokół RS232 oraz kamery 4K (H.265) dławiące komputery biurowe.",
                    solution: "Stworzenie middleware tłumaczącego sygnał RS232 na REST API (regex parser). Wdrożenie serwera streamującego wideo (FFmpeg) do transkodowania obrazu z kamer ANPR w czasie rzeczywistym.",
                    tech: ["IoT", "NestJS", "RS232", "Hardware", "FFmpeg"],
                    result: "Automatyczny zapis wagi po rozpoznaniu tablicy rejestracyjnej. 100% cyfryzacja procesu przyjęcia towaru.",
                    iconName: 'Wifi',
                    image: asset("img/anpr.jpg")
                },
                {
                    id: '3',
                    title: "Prywatny Asystent Sprzedaży AI z użyciem Lokalnych LLM i Architektury RAG",
                    subtitle: "GenAI • RAG • Prywatność",
                    challenge: "Dział handlowy potrzebował wsparcia AI w pisaniu e-maili, ale polityka firmy zabraniała wysyłania danych klientów do publicznych chmur (ChatGPT).",
                    solution: "Wdrożenie lokalnych modeli (Gemma/Phi) na własnej infrastrukturze (CPU optimized/AVX-512). Architektura RAG pobierająca dane klienta z bazy wektorowej i wstrzykująca je do promptu.",
                    tech: ["GenAI", "RAG", "Python", "Local LLM", "Privacy"],
                    result: "Bezpieczne generowanie spersonalizowanych ofert bez wycieku danych (GDPR compliant).",
                    iconName: 'Brain',
                    image: asset("img/ai.jpg")
                },
                {
                    id: '4',
                    title: "Dedykowany Mobilny CRM i Własne Sterowniki Drukarek dla Magazynu",
                    subtitle: "Mobile • Hardware",
                    challenge: "Brak sterowników do mobilnych drukarek Zebra dla specyficznego procesu etykietowania oraz potrzeba śledzenia połączeń handlowców.",
                    solution: "Reverse-engineering protokołu drukarki i napisanie własnego sterownika w CPCL. Stworzenie aplikacji Android integrującej logi połączeń z systemem ERP (most Firebase).",
                    tech: ["Android", "Kotlin", "Zebra", "CPCL", "Firebase"],
                    result: "Pełna kontrola nad procesem etykietowania stali i automatyczne raportowanie KPI działu handlowego.",
                    iconName: 'Smartphone',
                    image: asset("img/mobile.jpg")
                },
                {
                    id: '5',
                    title: "Zaawansowany System Ekstrakcji Faktur z Logiką 'Prompt-per-Vendor'",
                    subtitle: "AI • Computer Vision",
                    challenge: "Niska skuteczność klasycznych OCR (Tesseract) przy polskich fakturach i halucynacje modeli LLM przy analizie całych dokumentów.",
                    solution: "Odejście od OCR na rzecz analizy surowego PDF przez LLM. Opracowanie systemu dynamicznych promptów dobieranych na podstawie rozpoznanego NIP-u wystawcy faktury.",
                    tech: ["AI", "Computer Vision", "R&D", "Process Automation"],
                    result: "Wzrost skuteczności ekstrakcji danych z 75% do 95%.",
                    iconName: 'Brain',
                    image: asset("img/invoice.jpg")
                },
                {
                    id: '6',
                    title: "Skalowalna Architektura Widgetu Czat AI (SaaS)",
                    subtitle: "SaaS • Mikroserwisy",
                    challenge: "Stworzenie lekkiego widgetu czatu, który klienci mogą osadzić na dowolnej stronie, z obsługą historii rozmów i przejmowania czatu przez człowieka.",
                    solution: "Architektura mikroserwisowa oparta na Dockerze. Redis do obsługi sesji i cache’owania, Nginx jako reverse proxy, Postgres z Pgvector dla bazy wiedzy bota.",
                    tech: ["Microservices", "Docker", "Redis", "WebSockets"],
                    result: "Działający MVP obsługujący wielu tenantów z izolacją danych.",
                    iconName: 'Bot',
                    image: asset("img/chat.jpg")
                }
            ]
        },
        timeline: {
            title: "Ścieżka Inżynierska",
            items: [
                {
                    id: "1",
                    period: "Sie 2025 - Obecnie",
                    role: "DevOps Engineer",
                    company: "ULAMEX",
                    isCurrent: true,
                    description: "Zaprojektowanie i wdrożenie skalowalnej, multi-tenantowej platformy **GKE (Kubernetes)** od zera.",
                    details: [
                        "**Bezpieczeństwo:** Wdrożenie HashiCorp Vault, ModSecurity WAF i sieciowych polityk Zero Trust (Calico).",
                        "**Policy-as-Code:** Wymuszenie bezpiecznych kontekstów w klastrze przy użyciu Kyverno.",
                        "**IAM:** Scentralizowana kontrola dostępu z Zitadel (integracja OIDC).",
                        "**Obserwowalność:** Zbudowanie pełnego stosu monitoringu (Prometheus, Grafana, Loki, Jaeger)."
                    ]
                },
                {
                    id: "2",
                    period: "Lis 2022 - Lip 2025",
                    role: "Full Stack Developer & AI Integrator",
                    company: "ULAMEX",
                    isCurrent: false,
                    description: "Prowadzenie rozwoju wewnętrznego systemu ERP (NestJS/NextJS) integrującego GenAI i Industrial IoT.",
                    details: [
                        "**Applied AI (RAG):** Budowa \"Inteligentnego Asystenta Sprzedaży\" przy użyciu lokalnych LLM (Gemma), Milvus Vector DB i PostgreSQL.",
                        "**Mobile & Hardware:** Stworzenie natywnego CRM na Androida (Kotlin) i sterowników (CPCL) dla drukarek Zebra.",
                        "**IoT Integration:** Podłączenie wag przemysłowych RS232 i kamer ANPR (dekodowanie H.265) do webowego ERP."
                    ]
                },
                {
                    id: "3",
                    period: "2011 - 2022",
                    role: "Specjalista ds. Infrastruktury Przemysłowej i IT",
                    company: "Poprzednie Doświadczenie",
                    isCurrent: false,
                    description: "Ponad dekada praktycznego doświadczenia w zarządzaniu produkcją i wsparciu IT. Tło obejmuje zarządzanie produkcją i utrzymanie systemów elektromechanicznych. *\"To doświadczenie przemysłowe pozwala mi łączyć fizyczny sprzęt z oprogramowaniem w chmurze.\"*",
                    details: []
                }
            ]
        },
        services: {
            title: "Usługi",
            items: [
                {
                    title: "Kubernetes i Migracja do Chmury",
                    description: "Kompleksowa migracja aplikacji z VPS/On-prem do Google Kubernetes Engine (GKE). Audyt bezpieczeństwa, wdrożenie Infrastructure as Code (Terraform) oraz optymalizacja kosztów chmury.",
                    iconName: "Cloud"
                },
                {
                    title: "Dedykowane IoT i Integracja Hardware",
                    description: "Łączenie nietypowych urządzeń przemysłowych (wagi, kamery, czytniki RFID) z nowoczesnym webem. Obsługa protokołów RS232/Modbus i wizualizacja danych w czasie rzeczywistym.",
                    iconName: "Wifi"
                },
                {
                    title: "Lokalne AI i Wdrożenia RAG",
                    description: "Wdrażanie prywatnych modeli językowych (Ollama, Local LLM) dla firm, które obawiają się wycieku danych. Budowa baz wiedzy RAG i bezpiecznych asystentów AI działających na własnej infrastrukturze.",
                    iconName: "Brain"
                }
            ]
        },
        businessValue: {
            title: "Wartość dla Biznesu",
            items: [
                {
                    title: "Błyskawiczne Wdrażanie",
                    description: "Wykorzystuję inżynierię wspomaganą AI, aby dowozić dedykowane aplikacje NextJS i Android w rekordowym czasie, zachowując najwyższe standardy jakości kodu.",
                    iconName: "Zap"
                },
                {
                    title: "Ciągłość Operacyjna (SRE)",
                    description: "Przekładam rygor przemysłowy na 99.9% dostępności Twoich usług chmurowych, chroniąc Twój biznes przed kosztownymi przestojami.",
                    iconName: "ShieldCheck"
                },
                {
                    title: "Skalowalne Ekosystemy NestJS",
                    description: "Projektuję modułowe backendy heksagonalne, które eliminują dług technologiczny i gwarantują, że Twoja inwestycja będzie łatwa w rozwoju przez lata.",
                    iconName: "Layers"
                },
                {
                    title: "Efektywność AI & RAG",
                    description: "Zamieniam Twoje dane w przewagę konkurencyjną dzięki prywatnym systemom RAG, które automatyzują procesy i redukują koszty operacyjne.",
                    iconName: "TrendingUp"
                }
            ]
        },
        techStack: {
            title: "Stack Technologiczny",
            items: [
                {
                    category: "Cloud i DevOps",
                    items: ["Kubernetes (GKE, On-premise)", "Docker", "Helm", "Terraform", "Bash Scripting"],
                    iconName: 'Cloud'
                },
                {
                    category: "Bezpieczeństwo i Obserwowalność",
                    items: ["HashiCorp Vault", "ModSecurity WAF", "Calico (Zero Trust)", "Prometheus", "Grafana", "Loki", "Jaeger"],
                    iconName: 'Lock'
                },
                {
                    category: "Backend i AI",
                    items: ["NestJS (TypeScript)", "Python", "Local LLM Inference (Ollama, Gemma)", "RAG Architecture", "Milvus/Pgvector", "PostgreSQL", "Redis"],
                    iconName: 'Brain'
                },
                {
                    category: "Mobile, IoT i Hardware",
                    items: ["Android (Kotlin)", "Jetpack Compose", "RS232", "CPCL (Zebra Printers)", "Modbus", "ANPR Cameras", "Digital Scales"],
                    iconName: 'Wifi'
                }
            ]
        },
        contact: {
            cta: "Gotowy na optymalizację?",
            sub: "Dostępny na kontrakty B2B.",
            buttons: { cv: "Portfolio Techniczne (PDF)", linkedin: "Kontakt na LinkedIn", email: "Napisz Email" },
            linkedinUrl: "https://linkedin.com/in/placeholder",
            emailUrl: "konrad@example.com"
        },
        aiChat: {
            trigger: "Zapytaj AI o mnie",
            title: "Asystent Konrada",
            placeholder: "Zapytaj o Kubernetes, IoT lub AI...",
            initialMessage: "Cześć! Jestem Asystentem AI Konrada. Zapytaj mnie o projekty lub doświadczenie.",
            thinking: "Myślę...",
            error: "Błąd.",
            status: "Online"
        },
        nav: { home: "Home", projects: "Projekty", resume: "O mnie", services: "Usługi", contact: "Kontakt" },
        footer: "Open for B2B contracts.",
        landing: {
            hero: {
                headline: "Twoja Dokumentacja Techniczna dostępna w Slacku w 3 sekundy. Bez halucynacji.",
                subheadline: "Zautomatyzuj dzielenie się wiedzą. Bezpieczna architektura RAG dla zespołów technicznych i przemysłowych.",
                cta: "Umów Demo",
                demoImage: asset("img/slack_demo.png")
            },
            howItWorks: {
                title: "Jak to działa",
                steps: [
                    { title: "Dokumenty", description: "Twoje PDFy i Confluence są indeksowane.", iconName: "FileText" },
                    { title: "Baza Wektorowa", description: "Bezpieczne przechowywanie w Qdrant.", iconName: "Database" },
                    { title: "Analiza AI", description: "Gemini przetwarza kontekst i generuje odpowiedź.", iconName: "Brain" },
                    { title: "Slack", description: "Odpowiedź trafia natychmiast do zespołu.", iconName: "MessageSquare" }
                ]
            },
            security: {
                title: "Bezpieczeństwo przede wszystkim",
                description: "Infrastruktura utrzymywana przez inżyniera Cloud & Security. Twoje dane nie trenują modeli Google.",
                features: ["Izolacja Danych", "Zgodność z RODO", "Brak trenowania na danych klienta", "Szyfrowanie E2E"]
            },
            creator: {
                title: "O Twórcy",
                bio: "Cześć, jestem Konrad. Na co dzień projektuję infrastrukturę dla przemysłu. Zbudowałem to narzędzie, bo miałem dość szukania w PDF-ach. Stawiam na niezawodność, nie na hype.",
                name: "Konrad Sędkowski",
                role: "Senior DevOps & Founder",
                image: asset("portrait.jpg"),
                linkedin: "https://linkedin.com/in/placeholder"
            }
        }
    }
};
