import { PortfolioContent } from './types';

const IMAGES = {
  portrait: "/portrait.jpg",
  factory: "https://image.pollinations.ai/prompt/Heavy%20Industry%20Factory%20Floor%20Sparks%20Welding%20Robot%20Arm%20IoT%20Sensors%20Data%20Cables%20Connecting%20To%20Cloud%20Hologram%20Overlay?width=1024&height=1024&nologo=true",
  projectA: "https://image.pollinations.ai/prompt/Industrial%20Logistics%20Truck%20Weighing%20Station%20Night%20Cyberpunk%20Neon%20Lights%20Rain%20Reflections%20High%20Tech%20Overlay%20UI%20Data%20Visualization%204k%20realistic?width=1024&height=1024&nologo=true",
  projectB: "https://image.pollinations.ai/prompt/Artificial%20Intelligence%20Brain%20Neural%20Network%20Glowing%20Synapses%20Data%20Flow%20Digital%20Art%20Dark%20Background%20Blue%20Purple%20Neon?width=1024&height=1024&nologo=true",
  projectC: "https://image.pollinations.ai/prompt/Kubernetes%20Cluster%20Abstract%203D%20Visualization%20Server%20Racks%20Glowing%20Blue%20Neon%20Data%20Streams%20Isometric%20View%20Tech%20Background?width=1024&height=1024&nologo=true",
  projectD: "https://image.pollinations.ai/prompt/Android%20Car%20Telemetry%20Dashboard%20Digital%20Gauges%20Speedometer%20Neon%20Blue%20Accent%20Dark%20Interior%20Modern%20UI%20High%20Tech?width=1024&height=1024&nologo=true",
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
    title: "Infrastructure Architect & SRE Consultant",
    availability: "Available for B2B Contracts",
    hero: {
      headline: "Enterprise Infrastructure & Applied AI Solutions.",
      subheadline: "GKE Specialist and RAG Expert with 10+ years of industrial systems experience. I architect zero-trust Kubernetes platforms and private AI orchestration systems that solve complex physical and digital infrastructure challenges.",
      tags: ["GKE Specialist", "RAG Expert", "SRE Consultant"],
      cta: "View Case Studies",
      ctaSecondary: "Discuss Your Project",
      profileImage: IMAGES.portrait
    },
    philosophy: {
      title: "Engineering Pragmatism over Hype.",
      description: "I am not just a coder. With over a decade of experience in industrial mechanics and production systems management, I understand that software is a tool to solve business-critical problems. My trajectory from heavy machinery engineering to architecting scalable GKE clusters and deploying private RAG systems provides a unique perspective: I know how things work from the physical layer up.",
      differentiatorTitle: "Reliability & Observability",
      differentiator: "I don't build over-complicated solutions. I build idempotent, observable, and automated systems that drive efficiency—whether on a production line or in a Google Cloud cluster.",
      image: IMAGES.factory
    },
    projects: {
      title: "Consultancy Case Studies",
      labels: { challenge: "The Challenge", solution: "The Solution", result: "The Result" },
      items: [
        {
          id: '1',
          title: "Case Study: Enterprise RAG Orchestration & GenAI Integration",
          subtitle: "RAG • MLOps • Private LLM Deployment",
          challenge: "As a RAG Expert, I was engaged by an enterprise client whose standard OCR tools failed to extract structured data from multi-format industrial documentation, leading to 75% manual intervention. The requirement was a solution that understands layout context without expensive GPU instances, ensuring data sovereignty through on-premise deployment.",
          solution: "I engineered a hybrid pipeline leveraging hexagonal architecture principles: 1) Vision-First Domain: Replaced raw text extraction with YOLO v8 for document layout analysis. 2) Contextual RAG Port: Implemented Dynamic Prompting with Pgvector for vendor identification. 3) Hardware-Optimized Adapter: Optimized Gemma 7b quantization (GGUF) to run efficiently on Intel Xeon AVX-512 CPUs with AVX-512 intrinsics, eliminating dedicated GPU dependency while maintaining inference latency under 500ms.",
          tech: ["Python", "YOLO v8", "PgVector", "Gemma 7b (Quantized)", "Docker", "LangChain"],
          result: "Data extraction accuracy increased from 75% to 95%+. Processing time reduced from minutes to seconds per document. Cloud compute costs eliminated through edge deployment. Full data sovereignty maintained.",
          iconName: 'Brain',
          image: IMAGES.projectB
        },
        {
          id: '2',
          title: "Case Study: Industrial IoT & Edge Telemetry System",
          subtitle: "Industrial IoT • Edge Computing • SRE Observability",
          challenge: "A Tier-1 heavy industry client required real-time telemetry from legacy industrial hardware including 20-year-old heavy-duty truck scales and ANPR cameras. The equipment utilized archaic serial protocols (RS232/Modbus) and operated in air-gapped environments isolated from modern cloud-based ERP systems.",
          solution: "I designed an Edge-to-Cloud bridge implementing SRE-grade observability patterns: 1) Edge Gateway Adapter: Developed custom Node.js/Python middleware with circuit breaker patterns for resilience, running on industrial edge devices to buffer and parse binary RS232 streams into structured JSON. 2) Video Pipeline: Integrated FFmpeg transcoding (H.265 to H.264) with hardware acceleration for 4K ANPR feed processing. 3) Secure Transport: Established mutual-TLS tunnels for bidirectional communication with automatic failover.",
          tech: ["Node.js", "Python", "RS232/Modbus", "FFmpeg", "WebSockets", "Prometheus"],
          result: "Fully automated weighing process with 99.9% uptime. Eliminated manual data entry errors and enabled real-time inventory tracking. Observability stack provided sub-second alerting for edge device health.",
          iconName: 'Wifi',
          image: IMAGES.projectA
        },
        {
          id: '3',
          title: "Case Study: Zero-Trust GKE Infrastructure for Heavy Industry",
          subtitle: "DevSecOps • GKE Specialist • Zero-Trust Architecture",
          challenge: "Critical ERP systems were hosted on single-point-of-failure VPS infrastructure with manual deployment scripts and no secret management. Backup operations caused system freezes, and the absence of workload identity patterns created security vulnerabilities. The client required enterprise-grade SRE practices with zero-downtime guarantees.",
          solution: "As a GKE Specialist, I orchestrated a complete infrastructure overhaul following hexagonal architecture: 1) Infrastructure Core: Codified the entire stack using Terraform with remote state and state locking. 2) GKE Autopilot Port: Migrated workloads to a highly available multi-zonal cluster with Workload Identity for pod-level IAM. 3) Security Adapters: Implemented HashiCorp Vault with Kubernetes auth, Kyverno policies for Pod Security Standards, and Calico for network segmentation. 4) Observability Stack: Deployed Prometheus/Grafana/Loki with custom SLO dashboards and alertmanager routing.",
          tech: ["GCP (GKE)", "Terraform", "HashiCorp Vault", "Kyverno", "Calico", "GitLab CI"],
          result: "Achieved 99.9% uptime with automated CI/CD pipelines. Recovery Time Objective (RTO) reduced from hours to minutes through idempotent infrastructure-as-code. Zero-trust network segmentation eliminated lateral movement risks.",
          iconName: 'Cloud',
          image: IMAGES.projectC
        },
        {
          id: '4',
          title: "R&D: Edge Computing & Real-time Signal Processing",
          subtitle: "Android • Signal Processing • Edge Database",
          challenge: "Vehicle telemetry systems require high-frequency data acquisition (100Hz+) with local filtering to reduce cloud transmission costs and ensure offline capability. The challenge was implementing real-time signal processing on resource-constrained Android devices while maintaining data integrity and providing responsive UI feedback.",
          solution: "I architected an edge-first telemetry system: 1) Signal Processing Core: Implemented Moving Average Filters and exponential smoothing algorithms for noise reduction on accelerometer and gyroscope streams, with configurable window sizes for different driving conditions. 2) Local Persistence Port: Room DB with circular buffer pattern and automatic conflict resolution for offline-first architecture. 3) Integration Adapter: Spotify Web API integration for contextual music recommendations based on driving behavior patterns. 4) Observability: Local analytics with MPAndroidChart for real-time visualization.",
          tech: ["Kotlin", "Room DB", "Moving Average Filter", "MPAndroidChart", "WebSockets", "Spotify API"],
          result: "Reduced cloud data transmission by 85% through intelligent edge filtering. Achieved sub-10ms local processing latency for real-time haptic feedback. 100% offline functionality with seamless sync when connectivity restored.",
          iconName: 'Smartphone',
          image: IMAGES.projectD
        }
      ]
    },
    timeline: {
      title: "Professional Engagements",
      items: [
        {
          id: '1',
          period: "Current Engagement",
          role: "Infrastructure Architect & SRE Consultant",
          company: "Tier-1 Industrial Steel Distributor",
          description: "Leading zero-trust Kubernetes platform architecture for enterprise-grade ERP systems. Implementing GKE security hardening with Vault, Kyverno policies, and Calico network segmentation.",
          details: [
            "Architected multi-tenant GKE clusters with Workload Identity and Pod Security Standards",
            "Implemented HashiCorp Vault integration for dynamic secret management",
            "Established SRE observability stack: Prometheus, Grafana, Loki with custom SLOs",
            "Reduced infrastructure recovery time (RTO) from hours to minutes"
          ],
          isCurrent: true
        },
        {
          id: '2',
          period: "Previous Engagement",
          role: "DevSecOps Lead",
          company: "Enterprise Logistics Provider",
          description: "Delivered Industrial IoT edge computing solutions and RAG-based document processing pipelines for heavy industry clients.",
          details: [
            "Designed RS232/Modbus edge gateways with circuit breaker resilience patterns",
            "Implemented private RAG architectures with quantized LLMs on CPU-only infrastructure",
            "Built real-time video processing pipelines with FFmpeg transcoding",
            "Established CI/CD automation reducing deployment time by 80%"
          ],
          isCurrent: false
        },
        {
          id: '3',
          period: "Previous Engagement",
          role: "Systems Engineer",
          company: "Manufacturing Technology Partner",
          description: "Industrial systems integration and legacy hardware modernization for production environments.",
          details: [
            "Integrated 20-year-old industrial scales with modern cloud ERP systems",
            "Developed custom middleware for binary protocol translation",
            "Implemented automated backup and disaster recovery procedures"
          ],
          isCurrent: false
        }
      ]
    },
    services: {
      title: "Consulting & Implementation Services",
      items: [
        {
          title: "Enterprise GKE Platform Architecture",
          description: "Core: High-availability, security, and scalability. Ports: Managed GKE, Workload Identity, Multi-tenant isolation. Adapters: HashiCorp Vault, Kyverno policies, Terraform IaC, Calico CNI.",
          iconName: "Cloud"
        },
        {
          title: "Private RAG & LLM Orchestration",
          description: "Core: Secure data processing with context understanding. Ports: Vector DBs, local LLM inference, document pipelines. Adapters: Qdrant, LangChain, quantized Gemma, PgVector.",
          iconName: "Brain"
        },
        {
          title: "Industrial IoT & Edge Computing",
          description: "Core: Real-time telemetry, signal processing, observability. Ports: Edge gateways, protocol adapters, SRE monitoring. Adapters: RS232/Modbus bridges, Room DB, FFmpeg, Prometheus.",
          iconName: "Server"
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
      title: "The Arsenal",
      items: [
        { category: "Cloud Infrastructure", items: COMMON_TECH.cloud, iconName: 'Cloud' },
        { category: "Security & DevOps", items: COMMON_TECH.sec, iconName: 'Lock' },
        { category: "AI & Data Engineering", items: COMMON_TECH.ai, iconName: 'Brain' },
        { category: "Full-Stack & Mobile", items: COMMON_TECH.fullstack, iconName: 'Code' }
      ]
    },
    contact: {
      cta: "Available for B2B Contracts & Technical Consultations",
      sub: "Specializing in complex infrastructure migrations and private AI system design.",
      buttons: { cv: "Technical Portfolio (PDF)", linkedin: "Contact on LinkedIn", email: "Email Me" },
      linkedinUrl: "https://linkedin.com/in/placeholder",
      emailUrl: "konrad@example.com"
    },
    aiChat: {
      trigger: "Ask AI About Me",
      title: "Konrad's Assistant",
      placeholder: "Ask about GKE, RAG, or Industrial IoT...",
      initialMessage: "Hi! I'm Konrad's AI Assistant. Ask me about consultancy case studies, GKE architecture, RAG implementations, or SRE practices.",
      thinking: "Thinking...",
      error: "I encountered an error.",
      status: "Online (Gemini 2.5)"
    },
    landing: {
      hero: {
        headline: "Enterprise AI Assistant",
        subheadline: "RAG-powered Slack bot for instant document queries. Upload PDFs, get answers backed by your knowledge base.",
        cta: "Try Demo",
        demoImage: "/img/chat.jpg"
      },
      howItWorks: {
        title: "How It Works",
        steps: [
          {
            title: "Upload Documents",
            description: "Upload PDFs, manuals, or documentation to the knowledge base.",
            iconName: "FileText"
          },
          {
            title: "Vector Indexing",
            description: "Documents are chunked and indexed in Qdrant vector database.",
            iconName: "Database"
          },
          {
            title: "AI Processing",
            description: "Gemini AI processes queries with retrieved context.",
            iconName: "Brain"
          },
          {
            title: "Slack Response",
            description: "Answers delivered directly in your Slack workspace.",
            iconName: "MessageSquare"
          }
        ]
      },
      security: {
        title: "Enterprise Security",
        description: "Built with security-first architecture",
        features: ["End-to-end encryption", "VPC isolation", "GDPR compliant", "SOC 2 ready"]
      },
      creator: {
        title: "About the Architect",
        bio: "Infrastructure Architect & SRE Consultant specializing in GKE, RAG systems, and Industrial IoT. Building enterprise-grade solutions that bridge physical and digital infrastructure.",
        name: "Konrad Sędkowski",
        role: "Infrastructure Architect & SRE Consultant",
        image: "/portrait.jpg",
        linkedin: "https://linkedin.com/in/konrad-sedkowski"
      }
    },
    nav: { home: "Home", projects: "Case Studies", resume: "Professional Engagements", services: "Services", contact: "Contact" },
    footer: "Konrad Sędkowski. Engineered with React, NestJS, and Gemini AI on Cloud Run."
  },
  pl: {
    name: "Konrad Sędkowski",
    title: "Infrastructure Architect & SRE Consultant",
    availability: "Dostępny do Kontraktów B2B",
    hero: {
      headline: "Infrastruktura Przedsiębiorstwa i Rozwiązania AI.",
      subheadline: "Specjalista GKE i ekspert RAG z 10+ letnim doświadczeniem w systemach przemysłowych. Architekturuję platformy Kubernetes zero-trust oraz prywatne systemy orkiestracji AI, rozwiązujące złożone wyzwania infrastruktury fizycznej i cyfrowej.",
      tags: ["Specjalista GKE", "Ekspert RAG", "Konsultant SRE"],
      cta: "Zobacz Case Studies",
      ctaSecondary: "Omów Swój Projekt",
      profileImage: IMAGES.portrait
    },
    philosophy: {
      title: "Inżynierski Pragmatyzm ponad Hype.",
      description: "Nie jestem tylko programistą. Dzięki ponad dekadzie doświadczenia w inżynierii mechanicznej i zarządzaniu systemami produkcyjnymi, rozumiem że oprogramowanie jest narzędziem do rozwiązywania problemów krytycznych dla biznesu. Moja trajektoria od inżynierii ciężkich maszyn do architektury skalowalnych klastrów GKE i wdrażania prywatnych systemów RAG daje unikalną perspektywę: wiem jak rzeczy działają od warstwy fizycznej w górę.",
      differentiatorTitle: "Niezawodność i Obserwowalność",
      differentiator: "Nie buduję przekomplikowanych rozwiązań. Tworzę systemy idempotentne, obserwowalne i zautomatyzowane, które napędzają efektywność — czy na linii produkcyjnej, czy w klastrze Google Cloud.",
      image: IMAGES.factory
    },
    projects: {
      title: "Case Studies Konsultingowe",
      labels: { challenge: "Wyzwanie", solution: "Rozwiązanie", result: "Wynik" },
      items: [
        {
          id: '1',
          title: "Case Study: Orkiestracja RAG i Integracja GenAI",
          subtitle: "RAG • MLOps • Prywatne Wdrożenie LLM",
          challenge: "Jako ekspert RAG, zostałem zaangażowany przez klienta korporacyjnego, którego standardowe narzędzia OCR nie radziły sobie z ekstrakcją danych z wieloformatowej dokumentacji przemysłowej, wymuszając 75% ręcznej ingerencji. Wymaganiem było rozwiązanie rozumiejące kontekst layoutu bez drogich instancji GPU, zapewniające suwerenność danych przez wdrożenie on-premise.",
          solution: "Zaprojektowałem hybrydowy pipeline wykorzystujący zasady architektury heksagonalnej: 1) Domena Vision-First: Zastąpiłem surową ekstrakcję tekstu modelem YOLO v8 do analizy układu dokumentu. 2) Port RAG Kontekstowy: Zaimplementowałem Dynamiczne Prompty z Pgvector do identyfikacji dostawców. 3) Adapter Zoptymalizowany Sprzętowo: Zoptymalizowałem kwantyzację Gemma 7b (GGUF) do efektywnego działania na procesorach Intel Xeon AVX-512, eliminując zależność od dedykowanych GPU przy zachowaniu latencji inferencji poniżej 500ms.",
          tech: ["Python", "YOLO v8", "PgVector", "Gemma 7b (Kwantyzacja)", "Docker", "LangChain"],
          result: "Dokładność ekstrakcji danych wzrosła z 75% do 95%+. Czas przetwarzania skrócony z minut do sekund na dokument. Koszty obliczeniowe w chmurze wyeliminowane przez wdrożenie edge. Pełna suwerenność danych zachowana.",
          iconName: 'Brain',
          image: IMAGES.projectB
        },
        {
          id: '2',
          title: "Case Study: System IoT Przemysłowego i Telemetrii Edge",
          subtitle: "Industrial IoT • Edge Computing • Obserwowalność SRE",
          challenge: "Klient z branży ciężkiego przemysłu wymagał telemetrii w czasie rzeczywistym z legacy hardware, w tym 20-letnich wag ciężarowych i kamer ANPR. Sprzęt wykorzystywał archaiczne protokoły szeregowe (RS232/Modbus) i działał w środowiskach air-gapped, odizolowanych od nowoczesnych systemów ERP.",
          solution: "Zaprojektowałem most Edge-to-Cloud implementujący wzorce obserwowalności SRE: 1) Adapter Edge Gateway: Rozwijałem custom middleware Node.js/Python ze wzorcami circuit breaker dla odporności, działający na urządzeniach przemysłowych do buforowania i parsowania binarnych strumieni RS232 do strukturyzowanego JSON. 2) Pipeline Wideo: Zintegrowałem transkodowanie FFmpeg (H.265 do H.264) z akceleracją sprzętową dla przetwarzania strumieni 4K ANPR. 3) Bezpieczny Transport: Wdrożyłem tunele mutual-TLS dla komunikacji dwukierunkowej z automatycznym failover.",
          tech: ["Node.js", "Python", "RS232/Modbus", "FFmpeg", "WebSockets", "Prometheus"],
          result: "W pełni zautomatyzowany proces ważenia z 99.9% uptime. Eliminacja błędów ręcznego wprowadzania danych i włączenie śledzenia zapasów w czasie rzeczywistym. Stack obserwowalności zapewnił alerting sub-second dla zdrowia urządzeń edge.",
          iconName: 'Wifi',
          image: IMAGES.projectA
        },
        {
          id: '3',
          title: "Case Study: Infrastruktura Zero-Trust GKE dla Przemysłu Ciężkiego",
          subtitle: "DevSecOps • Specjalista GKE • Architektura Zero-Trust",
          challenge: "Krytyczne systemy ERP działały na infrastrukturze VPS z pojedynczym punktem awarii, ręcznymi skryptami wdrażania i brakiem zarządzania sekretami. Operacje backup powodowały zamrożenia systemu, a brak wzorców workload identity tworzył luki bezpieczeństwa. Klient wymagał praktyk SRE klasy korporacyjnej z gwarancją zero-downtime.",
          solution: "Jako Specjalista GKE, przeprowadziłem kompletną przebudowę infrastruktury zgodnie z architekturą heksagonalną: 1) Rdzeń Infrastruktury: Zakodowano cały stack przy użyciu Terraform z remote state i blokadą stanu. 2) Port GKE Autopilot: Migracja workloadów do klastra multi-zonal wysokiej dostępności z Workload Identity na poziomie pod. 3) Adaptery Bezpieczeństwa: Implementacja HashiCorp Vault z Kubernetes auth, polityki Kyverno dla Pod Security Standards i Calico dla segmentacji sieci. 4) Stack Obserwowalności: Wdrożenie Prometheus/Grafana/Loki z custom dashboardami SLO i routingiem alertmanager.",
          tech: ["GCP (GKE)", "Terraform", "HashiCorp Vault", "Kyverno", "Calico", "GitLab CI"],
          result: "Osiągnięto 99.9% uptime z zautomatyzowanymi pipeline'ami CI/CD. Cel Odzyskiwania Czasu (RTO) zredukowany z godzin do minut przez idempotentną infrastrukturę-as-code. Segmentacja sieci zero-trust wyeliminowała ryzyko lateral movement.",
          iconName: 'Cloud',
          image: IMAGES.projectC
        },
        {
          id: '4',
          title: "R&D: Edge Computing i Przetwarzanie Sygnałów Real-time",
          subtitle: "Android • Przetwarzanie Sygnałów • Baza Edge",
          challenge: "Systemy telemetrii pojazdów wymagają akwizycji danych wysokiej częstotliwości (100Hz+) z lokalnym filtrowaniem w celu redukcji kosztów transmisji do chmury i zapewnienia offline capability. Wyzwaniem było zaimplementowanie przetwarzania sygnałów real-time na urządzeniach Android z ograniczonymi zasobami przy zachowaniu integralności danych.",
          solution: "Zaprojektowałem system telemetry typu edge-first: 1) Rdzeń Przetwarzania Sygnałów: Implementacja filtrów Moving Average i wygładzania wykładniczego dla redukcji szumu na strumieniach akcelerometru i żyroskopu, z konfigurowalnymi oknami dla różnych warunków jazdy. 2) Port Persystencji Lokalnej: Room DB ze wzorcem circular buffer i automatycznym rozwiązywaniem konfliktów dla architektury offline-first. 3) Adapter Integracji: Integracja Spotify Web API dla kontekstowych rekomendacji muzycznych bazujących na wzorcach zachowań prowadzenia. 4) Obserwowalność: Lokalna analityka z MPAndroidChart dla wizualizacji real-time.",
          tech: ["Kotlin", "Room DB", "Moving Average Filter", "MPAndroidChart", "WebSockets", "Spotify API"],
          result: "Redukcja transmisji danych do chmury o 85% przez inteligentne filtrowanie edge. Osiągnięto latencję lokalnego przetwarzania poniżej 10ms dla real-time haptic feedback. 100% funkcjonalności offline z seamless sync przy przywróceniu łączności.",
          iconName: 'Smartphone',
          image: IMAGES.projectD
        }
      ]
    },
    timeline: {
      title: "Profesjonalne Zaangażowania",
      items: [
        {
          id: '1',
          period: "Aktualne Zaangażowanie",
          role: "Infrastructure Architect & SRE Consultant",
          company: "Tier-1 Dystrybutor Stali Przemysłowej",
          description: "Prowadzenie architektury platformy Kubernetes zero-trust dla systemów ERP klasy korporacyjnej. Implementacja hardeningu GKE z Vault, politykami Kyverno i segmentacją sieci Calico.",
          details: [
            "Zaprojektowano multi-tenant klastry GKE z Workload Identity i Pod Security Standards",
            "Wdrożono integrację HashiCorp Vault dla dynamicznego zarządzania sekretami",
            "Ustanowiono stack obserwowalności SRE: Prometheus, Grafana, Loki z custom SLOs",
            "Zredukowano czas odzyskiwania infrastruktury (RTO) z godzin do minut"
          ],
          isCurrent: true
        },
        {
          id: '2',
          period: "Poprzednie Zaangażowanie",
          role: "DevSecOps Lead",
          company: "Enterprise Dostawca Logistyczny",
          description: "Dostarczanie rozwiązań edge computing IoT przemysłowego i pipeline'ów przetwarzania dokumentów RAG dla klientów z branży ciężkiego przemysłu.",
          details: [
            "Zaprojektowano brzegowe gatewaye RS232/Modbus ze wzorcami circuit breaker",
            "Wdrożono prywatne architektury RAG z kwantyzowanymi LLM na infrastrukturze CPU-only",
            "Zbudowano pipeline'y przetwarzania wideo real-time z transkodowaniem FFmpeg",
            "Ustanowiono automatyzację CI/CD redukującą czas deploymentu o 80%"
          ],
          isCurrent: false
        },
        {
          id: '3',
          period: "Poprzednie Zaangażowanie",
          role: "Systems Engineer",
          company: "Partner Technologiczny Produkcyjny",
          description: "Integracja systemów przemysłowych i modernizacja legacy hardware dla środowisk produkcyjnych.",
          details: [
            "Zintegrowano 20-letnie wagi przemysłowe z nowoczesnymi systemami ERP w chmurze",
            "Rozwinięto custom middleware dla translacji protokołów binarnych",
            "Wdrożono zautomatyzowane procedury backup i disaster recovery"
          ],
          isCurrent: false
        }
      ]
    },
    services: {
      title: "Usługi Konsultingowe i Wdrożeniowe",
      items: [
        {
          title: "Architektura Platformy Enterprise GKE",
          description: "Core: Wysoka dostępność, bezpieczeństwo, skalowalność. Ports: Managed GKE, Workload Identity, Izolacja multi-tenant. Adapters: HashiCorp Vault, Polityki Kyverno, Terraform IaC, Calico CNI.",
          iconName: "Cloud"
        },
        {
          title: "Prywatna Orkiestracja RAG i LLM",
          description: "Core: Bezpieczne przetwarzanie danych z rozumieniem kontekstu. Ports: Bazy wektorowe, lokalna inferencja LLM, pipeline'y dokumentów. Adapters: Qdrant, LangChain, kwantyzowana Gemma, PgVector.",
          iconName: "Brain"
        },
        {
          title: "Przemysłowy IoT i Edge Computing",
          description: "Core: Telemetria real-time, przetwarzanie sygnałów, obserwowalność. Ports: Edge gateways, adaptery protokołów, monitoring SRE. Adapters: Mosty RS232/Modbus, Room DB, FFmpeg, Prometheus.",
          iconName: "Server"
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
      title: "Arsenał Technologiczny",
      items: [
        { category: "Infrastruktura Chmurowa", items: COMMON_TECH.cloud, iconName: 'Cloud' },
        { category: "Bezpieczeństwo i DevOps", items: COMMON_TECH.sec, iconName: 'Lock' },
        { category: "Inżynieria AI i Danych", items: COMMON_TECH.ai, iconName: 'Brain' },
        { category: "Full-Stack i Mobile", items: COMMON_TECH.fullstack, iconName: 'Code' }
      ]
    },
    contact: {
      cta: "Dostępny do Kontraktów B2B i Konsultacji Technicznych",
      sub: "Specjalizacja w złożonych migracjach infrastruktury i projektowaniu prywatnych systemów AI.",
      buttons: { cv: "Portfolio Techniczne (PDF)", linkedin: "Kontakt na LinkedIn", email: "Napisz Email" },
      linkedinUrl: "https://linkedin.com/in/placeholder",
      emailUrl: "konrad@example.com"
    },
    aiChat: {
      trigger: "Zapytaj AI o mnie",
      title: "Asystent Konrada",
      placeholder: "Zapytaj o GKE, RAG lub Industrial IoT...",
      initialMessage: "Cześć! Jestem Asystentem AI Konrada. Zapytaj mnie o case studies konsultingowe, architekturę GKE, implementacje RAG lub praktyki SRE.",
      thinking: "Myślę...",
      error: "Wystąpił błąd.",
      status: "Online (Gemini 2.5)"
    },
    landing: {
      hero: {
        headline: "Enterprise AI Assistant",
        subheadline: "RAG-powered Slack bot do natychmiastowych zapytań o dokumenty. Prześlij PDF-y, otrzymaj odpowiedzi wsparte bazą wiedzy.",
        cta: "Wypróbuj Demo",
        demoImage: "/img/chat.jpg"
      },
      howItWorks: {
        title: "Jak To Działa",
        steps: [
          {
            title: "Prześlij Dokumenty",
            description: "Prześlij PDF-y, instrukcje lub dokumentację do bazy wiedzy.",
            iconName: "FileText"
          },
          {
            title: "Indeksowanie Wektorowe",
            description: "Dokumenty są dzielone na fragmenty i indeksowane w bazie wektorowej Qdrant.",
            iconName: "Database"
          },
          {
            title: "Przetwarzanie AI",
            description: "Gemini AI przetwarza zapytania z wykorzystaniem pobranego kontekstu.",
            iconName: "Brain"
          },
          {
            title: "Odpowiedź w Slack",
            description: "Odpowiedzi dostarczane bezpośrednio w Twoim workspace Slack.",
            iconName: "MessageSquare"
          }
        ]
      },
      security: {
        title: "Bezpieczeństwo Enterprise",
        description: "Zbudowane z architekturą security-first",
        features: ["Szyfrowanie end-to-end", "Izolacja VPC", "Zgodność z GDPR", "Gotowość SOC 2"]
      },
      creator: {
        title: "O Architekcie",
        bio: "Infrastructure Architect & SRE Consultant specjalizujący się w GKE, systemach RAG i Industrial IoT. Budowanie rozwiązań klasy enterprise łączących infrastrukturę fizyczną i cyfrową.",
        name: "Konrad Sędkowski",
        role: "Infrastructure Architect & SRE Consultant",
        image: "/portrait.jpg",
        linkedin: "https://linkedin.com/in/konrad-sedkowski"
      }
    },
    nav: { home: "Home", projects: "Case Studies", resume: "Profesjonalne Zaangażowania", services: "Usługi", contact: "Kontakt" },
    footer: "Konrad Sędkowski. Zbudowano w React, NestJS i Gemini AI na Cloud Run."
  }
};

// We export English by default for the AI system prompt to contain raw data,
// but we add an instruction to speak the user's language.
const DATA = TRANSLATIONS.en;

export const SYSTEM_INSTRUCTION = `
You are "Konrad's AI Assistant", a helpful agent on the portfolio website of Konrad Sędkowski, an Infrastructure Architect & SRE Consultant.
Your goal is to answer questions about Konrad's experience, skills, and consultancy case studies in a professional, senior-level manner suitable for B2B clients and technical decision-makers.

IMPORTANT LANGUAGE INSTRUCTION:
- If the user asks in Polish, reply in Polish.
- If the user asks in English, reply in English.
- If the user is viewing the Polish version of the site (implied by context), prefer Polish.

Context Data:
Bio: ${DATA.hero.subheadline}
Philosophy: ${DATA.philosophy.description}
Key Differentiator: ${DATA.philosophy.differentiator}
Availability: ${DATA.availability}

Consultancy Case Studies (Projects):
${DATA.projects.items.map(p => `### ${p.title} (${p.subtitle})
Challenge: ${p.challenge}
Solution: ${p.solution}
Tech: ${p.tech.join(', ')}
Result: ${p.result}`).join('\n\n')}

Professional Engagements:
${DATA.timeline.items.map(e => `- ${e.role} at ${e.company}: ${e.description}`).join('\n')}

Services (Hexagonal Architecture):
${DATA.services.items.map(s => `- ${s.title}: ${s.description}`).join('\n')}

Tech Stack:
${DATA.techStack.items.map(t => `- ${t.category}: ${t.items.join(', ')}`).join('\n')}

Contact:
Users can contact Konrad via LinkedIn or Email.

TONE GUIDELINES:
- Use senior-level engineering terminology (idempotency, observability, workload identity, circuit breakers)
- Focus on business outcomes and technical depth
- Maintain professional, consultant-level communication
`;
