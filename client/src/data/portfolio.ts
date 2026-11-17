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
        title: "DevOps, IoT & AI services for companies",
        availability: "Taking on new projects",
        hero: {
            headline: "I deploy cloud, integrate machines and automate work with AI.",
            subheadline: "One engineer from the first call to production. Production Kubernetes on Google Cloud every day. Billed with a VAT invoice.",
            tags: ["DevOps", "Kubernetes", "Industrial IoT"],
            cta: "Book a free call",
            ctaSecondary: "See case studies",
            profileImage: asset("portrait.webp")
        },
        philosophy: {
            title: "Engineering Pragmatism over Hype.",
            description: "I am not just a coder. With over a decade of experience in mechanics and production management, I understand that software is merely a tool to solve business problems. My path from repairing heavy machinery to architecting scalable Kubernetes clusters and training AI models gives me a unique advantage: I know how things work from the inside out.",
            differentiatorTitle: "Reliability & Automation",
            differentiator: "I don't build over-complicated solutions. I build reliable, secure, and automated systems that drive efficiency—whether it's on a production line or in a Google Cloud cluster.",
            image: asset("img/industrial.webp")
        },
        projects: {
            title: "Delivered projects",
            labels: { challenge: "The Challenge", solution: "The Solution", result: "The Result" },
            items: [
                {
                    id: '1',
                    title: "Secure Multi-Tenant Container Platform on Google Cloud (GKE)",
                    subtitle: "DevSecOps • Kubernetes",
                    challenge: "Migrating an ERP system from a fragile VPS infrastructure (Single Point of Failure, backup issues) to a scalable cloud environment.",
                    solution: "Designed a GKE cluster from scratch. Implemented HashiCorp Vault for secrets, Calico for Default Deny network policies, and WAF at Ingress. Automated deployment with Helm and Bash scripts.",
                    tech: ["Kubernetes", "DevSecOps", "GKE", "Terraform", "Vault"],
                    result: "Removed the single-VPS point of failure: HA control plane, automated backups/DR, and a hardened, policy-enforced cluster.",
                    iconName: 'Cloud',
                    image: asset("img/gke.webp")
                },
                {
                    id: '8',
                    title: "AI That Turns Order Emails into Draft Sales Orders in ERP",
                    subtitle: "AI • Process automation",
                    challenge: "Sales staff retyped orders from emails into the ERP by hand.",
                    solution: "A cloud model (Gemini) reads the email and extracts the order lines. The self-hosted Basal decision model matches them against the product catalogue and reports how confident each match is. The result is a draft sales order: the salesperson gets a private notification, and the document is created in the sales system only after their click.",
                    tech: ["Basal", "Gemini", "NestJS", "PostgreSQL"],
                    result: "Running as a pilot. Product matching is done by a decision model on company hardware, and no order is created without human approval.",
                    iconName: 'Bot',
                    image: asset("img/services/automation.webp")
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
                    image: asset("img/anpr.webp")
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
                    image: asset("img/ai.webp")
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
                    image: asset("img/mobile.webp")
                },
                {
                    id: '5',
                    title: "Advanced Invoice Extraction System with 'Prompt-per-Vendor' Logic",
                    subtitle: "AI • Computer Vision",
                    challenge: "Low accuracy of classic OCR (Tesseract) with Polish invoices and LLM hallucinations when analyzing entire documents.",
                    solution: "Moved from OCR to raw PDF analysis via LLM. Developed a system of dynamic prompts selected based on the recognized Invoice Issuer NIP.",
                    tech: ["AI", "Computer Vision", "R&D", "Process Automation"],
                    result: "Sharply reduced manual correction vs. classic OCR (internal results, not an audited benchmark).",
                    iconName: 'Brain',
                    image: asset("img/invoice.webp")
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
                    image: asset("img/chat.webp")
                },
                {
                    id: '7',
                    title: "AI Knowledge Sandbox",
                    subtitle: "RAG • Personal AI Lab",
                    challenge: "Ephemeral RAG environment for personal knowledge exploration",
                    solution: "A private 24-hour sandbox where you can upload documents (PDF, TXT, MD) and chat with an AI that answers based only on your uploaded content. Uses Qdrant vector database, Gemini AI, and Firebase authentication with anonymous sign-in.",
                    tech: ["RAG", "Qdrant", "Gemini AI", "Firebase Auth", "Vector Search"],
                    result: "Secure, isolated environment for experimenting with RAG technology on your own documents.",
                    iconName: 'FlaskConical',
                    image: asset("img/airag.jpg"),
                    link: '/lab',
                    image: asset("img/airag.webp"),
                    languageBadge: 'en'
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
            title: "What I can do for you",
            deliverablesLabel: "What you get",
            firstStepLabel: "We start with",
            cta: "Ask about this service",
            items: [
                {
                    title: "Cloud & Kubernetes migration",
                    description: "I move applications from a VPS or your own server room to Google Cloud (GKE or Cloud Run), with the whole infrastructure written as code and a rollback plan.",
                    deliverables: [
                        "Audit of the current infrastructure and its cost",
                        "Infrastructure in Terraform, reproducible with one command",
                        "CI/CD without service account keys (Workload Identity)",
                        "Monitoring, logs and alerts (Prometheus, Grafana, Loki)",
                        "Documentation and handover to your team"
                    ],
                    firstStep: "An audit and a migration plan",
                    iconName: "Cloud",
                    image: asset("img/services/cloud.webp")
                },
                {
                    title: "Industrial device integration",
                    description: "I connect scales, cameras, readers and printers to ERP systems and web apps, also when the device only speaks RS232 or Modbus.",
                    deliverables: [
                        "Survey of the devices and their protocols",
                        "Middleware exposing an API for your system",
                        "Live view of the data",
                        "An Android app when the process needs one",
                        "User manual and support after go-live"
                    ],
                    firstStep: "A survey of devices and protocols",
                    iconName: "Wifi",
                    image: asset("img/services/iot.webp")
                },
                {
                    title: "Private AI & knowledge bases (RAG)",
                    description: "An AI assistant that answers from your own documents. The data can stay on your infrastructure, without being sent to public models.",
                    deliverables: [
                        "Review of your documents and use cases",
                        "Knowledge base with semantic search",
                        "Local model (Ollama) or cloud model (Gemini), your choice",
                        "Integration with Slack, your website or internal system",
                        "Measurement of answer quality and cost"
                    ],
                    firstStep: "A workshop and a prototype on your documents",
                    iconName: "Brain",
                    image: asset("img/services/rag.webp")
                },
                {
                    title: "Office process automation with AI",
                    description: "I automate repetitive office work: recognising orders in emails, reading invoices, filling in ERP data. I choose the models by how sensitive the data is: local where data must not leave the company, cloud where that is acceptable.",
                    deliverables: [
                        "Review of your processes and the ones worth automating",
                        "Models chosen by data sensitivity: local or cloud",
                        "Integration with email, ERP or spreadsheets",
                        "The model reports how confident it is, and uncertain cases go to a human",
                        "Measurement of the time saved"
                    ],
                    firstStep: "A process review and a pilot on one of them",
                    iconName: "Bot",
                    image: asset("img/services/automation.webp")
                }
            ]
        },
        process: {
            title: "How we work together",
            steps: [
                { title: "Free call", description: "30 minutes. You describe the problem, I tell you plainly whether and how I can help." },
                { title: "Scope and quote", description: "You get a written scope of work, a schedule and a price." },
                { title: "Delivery", description: "I work in stages. After each stage you see a working result." },
                { title: "Handover and invoice", description: "Documentation, a walkthrough for your team and a VAT invoice issued by letmework.ai sp. z o.o." }
            ]
        },
        faq: {
            title: "Questions before we talk",
            items: [
                { question: "Who do I sign the contract with?", answer: "I do the work personally. The contract and the VAT invoice are issued by letmework.ai sp. z o.o. For you it means one contract with a company and one engineer doing the work." },
                { question: "How much does it cost?", answer: "It depends on the scope. After the free call you get a quote for a defined result, or an hourly rate for ongoing work." },
                { question: "Do you work remotely?", answer: "Yes, most of the work is done remotely. For device integration we agree on-site work individually." },
                { question: "What about confidentiality?", answer: "We can sign an NDA before the first technical conversation. I only ask for the access the job requires." },
                { question: "What happens after go-live?", answer: "You get the code and the documentation. We can also agree on ongoing support." }
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
                    description: "An industrial reliability mindset: idempotent IaC, observability and DR — I design for failure instead of assuming uptime.",
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
            cta: "Tell me what you want to build.",
            sub: "I read and answer every enquiry personally.",
            buttons: { cv: "Technical Portfolio (PDF)", linkedin: "LinkedIn", github: "GitHub", email: "Email Me", tryLab: "Try Personal AI Lab (24h Session)" },
            form: {
                name: "Name",
                email: "Work email",
                service: "What is it about?",
                serviceOther: "Something else",
                message: "Describe the problem in a few sentences",
                submit: "Send enquiry",
                sending: "Sending...",
                success: "Thank you. Your enquiry has reached me and I will reply by email.",
                error: "Sending failed. Please write to me directly:",
                privacy: "I use the data from this form only to answer your enquiry."
            },
            linkedinUrl: "www.linkedin.com/in/konrad-sędkowski-329644176",
            githubUrl: "https://github.com/halo2008",
            emailUrl: "konrad.sedkowski@letmework.ai"
        },
        aiChat: {
            trigger: "Ask AI About Me",
            title: "Konrad's Assistant",
            placeholder: "Ask about Kubernetes, IoT, or AI...",
            initialMessage: "Hi! I'm Konrad's AI Assistant. Ask me about my projects or experience.",
            thinking: "Thinking...",
            error: "Error.",
            status: "Online",
            rateLimitNote: "Note: Using free-tier API. If you see a 503 error, the rate limit has been reached. Try again in a minute."
        },
        telemetry: {
            title: "Live Infrastructure Telemetry",
            description: "Real-time performance metrics directly from the production environment, monitored via Prometheus and Grafana."
        },
        nav: { home: "Home", projects: "Case studies", resume: "About me", services: "Services", contact: "Contact" },
        footer: "Konrad Sędkowski. Contracts and VAT invoices: letmework.ai sp. z o.o.",
        home: {
            meta: {
                title: "Konrad Sędkowski: automation for wholesale and distribution",
                skip: "Skip to content",
                menu: "Menu",
                navLabel: "Main"
            },
            nav: {
                services: "Services",
                about: "About me",
                work: "Work",
                product: "ERP system",
                questions: "Questions",
                groups: ["AI in the company", "Infrastructure"],
                hints: ["Orders from emails, no retyping", "Answers from your procedures", "Migration and upkeep", "Scales, cameras, label printers"],
                language: { label: "Polski", code: "pl" }
            },
            hero: {
                title: "Less manual work in wholesale",
                lead: "I cut manual work around orders, documents and devices in sales and the warehouse. I start with one process and the programs the company already has. The first call, 30 minutes, is free.",
                primary: "Book a free call",
                secondary: "See the work",
                inbox: {
                    label: "Orders-from-email panel: four drafts matched at 91 to 97 percent wait for approval, one matched at 58 percent needs a check",
                    app: "Orders from email",
                    view: "Pilot demo",
                    search: "Search",
                    folders: [{ name: "To approve", count: 4 }, { name: "To check", count: 1 }, { name: "Approved" }, { name: "Rejected" }],
                    columns: ["Sender and lines", "Match", "Action"],
                    approve: "Approve",
                    review: "To check",
                    rows: [
                        { sender: "Sample Wholesale", items: "Nitrile gloves M × 20 boxes, packing tape × 12", match: 97 },
                        { sender: "Test Shop", items: "Stretch film × 6 rolls, box 40×30×20 × 150", match: 94 },
                        { sender: "Sample Bakery", items: "Paper bags × 500, “the same as last time”", match: 58, review: true },
                        { sender: "Test Workshop", items: "Paper towels × 24, hand soap 5 l × 4", match: 96 },
                        { sender: "Model Company", items: "Thermal labels 100×150 × 10 rolls", match: 91 }
                    ],
                    open: {
                        title: "Sample Bakery: order draft",
                        mail: "“Please send 500 paper bags and the same as last time.”",
                        fix: "Fix the line",
                        lines: [
                            { name: "Paper bags 30×40 cm", qty: "500 pcs", match: 97 },
                            { name: "“the same as last time”: 2 matching products", qty: "?", match: 58, pick: "Pick a product" }
                        ]
                    }
                }
            },
            services: {
                title: "Four automation services",
                lead: "First I check what can be done in the programs you already use.",
                items: [
                    { title: "Office work automation", text: "An order from an email becomes a draft to approve instead of lines to retype. A local or cloud model, depending on the data.", photo: { src: asset("assets/img/ai-office-automation.webp"), small: asset("assets/img/ai-office-automation-500.webp"), medium: asset("assets/img/ai-office-automation-960.webp"), alt: "A salesperson's hand on a mouse in front of a monitor listing orders from emails, some approved, some waiting", width: 1280, height: 853 } },
                    { title: "AI assistant built on company documents", text: "Staff ask about a procedure or an offer and get the answer from your documents. The data can stay on your servers.", photo: { src: asset("assets/img/photo-f63536476.webp"), small: asset("assets/img/photo-f63536476-500.webp"), medium: asset("assets/img/photo-f63536476-960.webp"), alt: "Archive shelves holding labelled boxes of documents", width: 1280, height: 903 } },
                    { title: "Google Cloud for company systems", text: "I move company apps to the cloud and run them: backups, monitoring, a rollback plan.", photo: { src: asset("assets/img/photo-f6212692-960.webp"), small: asset("assets/img/photo-f6212692-500.webp"), medium: asset("assets/img/photo-f6212692-960.webp"), alt: "Rows of server cabinets in a bright data centre hall", width: 960, height: 640 } },
                    { title: "Devices that write the data themselves", text: "A scale, camera, reader or label printer saves the data on its own: no paper slip, no second entry.", photo: { src: asset("assets/img/photo-f192577777.webp"), small: asset("assets/img/photo-f192577777-500.webp"), medium: asset("assets/img/photo-f192577777-960.webp"), alt: "A touch control panel mounted on a steel machine cabinet", width: 1280, height: 852 } }
                ]
            },
            product: {
                title: "An ERP for companies, when programs are not enough",
                lead: "When the data is spread across programs and spreadsheets, I propose the system I co-create, in one of two forms: in the letmework.ai cloud, with a sales app and the Lemy assistant, or locally on your server as an add-on to Subiekt GT. letmework.ai holds the licence; I roll it out.",
                tabs: ["Sales", "Warehouse", "Logistics", "AI assistant"],
                trackerTitle: "A sales app with the Lemy voice assistant",
                trackerText: "The rep dictates a note after a meeting and Lemy saves it to the customer card after a yes. Calls and texts from new numbers wait to be assigned to a customer with one tap.",
                cta: "Book a system demo",
                topic: "ERP system and Tracker app",
                subiekt: "The local version for Subiekt GT"
            },
            statement: {
                label: "Results from public letmework.ai case studies",
                before: "I started at the machines: as a mechanic, operator and shift foreman in ceramics factories. That is why I start from how people work, not from technology. The systems I build take ",
                facts: [
                    { value: "8×", label: "more regular customers per sales rep at Ulamex: up to 300, eight times more than before" },
                    { value: "~10k zł", label: "for warehouse hardware at Ulamex, instead of about 1 m zł for an off-the-shelf WMS" },
                    { value: "8 → 1", label: "tools in Marketstal's order handling, from import to goods receipt" }
                ],
                strong: "manual work",
                after: " off people."
            },
            process: {
                title: "Working together in 4 steps",
                steps: [
                    { title: "Free call, 30 minutes", text: "I tell you plainly whether and how I can help." },
                    { title: "Analysis of one process, free", text: "A map of today's work, the places where data is retyped, access to the data and a pilot plan. The result stays with you, even without a further order." },
                    { title: "Pilot or delivery in stages", text: "After each stage you see a working result." },
                    { title: "Handover and invoice", text: "Documentation, a walkthrough with your team and a VAT invoice from letmework.ai sp. z o.o." }
                ]
            },
            work: {
                title: "6 projects: the problem and the result",
                lead: "Each one started with a task someone repeated by hand every day.",
                appsTitle: "Apps for sales and the warehouse",
                open: "See the screen",
                close: "Close",
                items: [
                    { title: "ERP moved to Google Cloud", text: "Production left the rented servers, and the whole environment can be rebuilt from the repository. Backups run by themselves.", photo: { src: asset("assets/img/photo-f37336988.webp"), small: asset("assets/img/photo-f37336988-500.webp"), medium: asset("assets/img/photo-f37336988-960.webp"), alt: "Blue network cables plugged into a switch in a server cabinet", width: 1280, height: 720 } },
                    { title: "Truck weighbridge with ANPR cameras", text: "A camera reads the plate and the weight lands in the ERP against the right delivery. Nobody retypes slips, and the camera feed runs in the browser.", photo: { src: asset("assets/img/ai-weighbridge.webp"), small: asset("assets/img/ai-weighbridge-500.webp"), medium: asset("assets/img/ai-weighbridge-960.webp"), alt: "A semi-trailer truck on a weighbridge, an ANPR camera on a pole, a barrier and a weighing booth", width: 1280, height: 853 } },
                    { title: "AI drafts orders from emails", text: "A pilot: products are matched by a decision model on company hardware. No order is created without the salesperson's approval.", photo: { src: asset("assets/img/photo-f51440522.webp"), small: asset("assets/img/photo-f51440522-500.webp"), medium: asset("assets/img/photo-f51440522-960.webp"), alt: "An open laptop on a wooden table in an office", width: 1280, height: 853 } },
                    { title: "A CRM app for over 50 salespeople", text: "An Android app linked to the phone system logs customer calls on its own. The manager sees contacts as they happen, with no manual reports.", photo: { src: asset("assets/img/ai-mobile-crm.webp"), small: asset("assets/img/ai-mobile-crm-500.webp"), medium: asset("assets/img/ai-mobile-crm-960.webp"), alt: "A salesperson's hands holding a smartphone showing a list of recent customer calls", width: 1280, height: 853 } },
                    { title: "Labels printed from a phone on Zebra printers", text: "I wrote a driver for mobile printers, so warehouse staff print labels straight from the phone app.", photo: { src: asset("assets/img/ai-label-printer.webp"), small: asset("assets/img/ai-label-printer-500.webp"), medium: asset("assets/img/ai-label-printer-960.webp"), alt: "A mobile label printer on a warehouse worker's belt, a barcode label coming out", width: 1280, height: 853 } },
                    { title: "An AI assistant writes offers for customers", text: "The model knows each customer's purchase history and suggests complementary products. The salesperson gets a ready offer draft; the model runs on the company's server.", photo: { src: asset("assets/img/ai-sales-assistant.webp"), small: asset("assets/img/ai-sales-assistant-500.webp"), medium: asset("assets/img/ai-sales-assistant-960.webp"), alt: "A laptop in a sales office showing a draft offer email with product tiles", width: 1280, height: 853 } }
                ],
            },
            faq: {
                title: "5 questions before the call",
                link: "Send an email",
                items: [
                    { question: "Does the company have to change its system?", answer: "No. I start from the programs you use today. I propose a new system only when the analysis shows it is needed, and I say plainly that I co-create it." },
                    { question: "Who does the company sign the contract with?", answer: "The contract and the VAT invoice come from letmework.ai sp. z o.o. I do the work myself." },
                    { question: "How much do the services cost?", answer: "It depends on the scope: a quote for a defined result or an hourly rate." },
                    { question: "What about the company's confidential data?", answer: "We can sign a non-disclosure agreement before the first technical conversation. I ask only for the access the job requires." },
                    { question: "What does the company get after go-live?", answer: "For work made to order: the code and the documentation. For the ERP: a letmework.ai licence. Ongoing support is possible too." }
                ]
            },
            about: {
                title: "Konrad Sędkowski, automation engineer",
                paragraphs: [
                    "Since 2025 I have run the infrastructure and releases of an ERP platform used by many companies. I moved it from rented servers to Google Cloud.",
                    "In it I built, among other things, single sign-on, online payments with BLIK and invoices, monitoring with alerts and GPS fleet tracking.",
                    "Before that I spent nearly three years developing the ERP system of a trading company: an app for over 50 salespeople, scales and cameras connected to the system, and an AI sales assistant."
                ],
                portraitAlt: "Konrad Sędkowski in a leather jacket, in a server room"
            },
            call: {
                title: "A free call, 30 minutes",
                lead: "I read every enquiry myself and reply by email.",
                form: {
                    name: "Full name",
                    email: "Work email",
                    service: "Subject of the call",
                    serviceOther: "Another subject",
                    analysis: "Free analysis of one process",
                    message: "The problem",
                    nameError: "Write your full name.",
                    emailError: "Write an email address with an @.",
                    messageError: "Describe the problem in at least 10 characters.",
                    fix: "Fields to fix: {n}.",
                    sending: "Sending",
                    sent: "Your request for a free call is in. I will reply by email.",
                    failed: "Sending failed. Write to me directly:",
                    privacy: "I use the data from this form only to answer this enquiry."
                }
            },
            close: {
                title: "The first call takes 30 minutes",
                lead: "It is free, and so is the analysis of one process that follows it."
            },
            footer: {
                lede: "Contracts and VAT invoices are issued by letmework.ai sp. z o.o.",
                columns: ["Offer", "Information", "Contact", "More"],
                lab: "AI lab",
                credits: "Photographs: Wikimedia Commons and AI illustrations"
            },
            consent: {
                text: "I turn on Google Analytics visit statistics only with your consent.",
                accept: "Turn statistics on",
                reject: "Decline statistics",
                label: "Statistics consent"
            }
        },
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
                role: "Platform / DevOps Engineer",
                image: asset("portrait.webp"),
                linkedin: "www.linkedin.com/in/konrad-sędkowski-329644176"
            }
        }
    },
    pl: {
        name: "Konrad Sędkowski",
        title: "Usługi DevOps, IoT i AI dla firm",
        availability: "Przyjmuję nowe zlecenia",
        hero: {
            headline: "Wdrażam chmurę, integruję maszyny i automatyzuję pracę z AI.",
            subheadline: "Jeden inżynier od pierwszej rozmowy po wdrożenie. Produkcyjny Kubernetes na Google Cloud na co dzień. Rozliczenie fakturą VAT.",
            tags: ["DevOps", "Kubernetes", "Industrial IoT"],
            cta: "Umów bezpłatną rozmowę",
            ctaSecondary: "Zobacz realizacje",
            profileImage: asset("portrait.webp")
        },

        philosophy: {
            title: "Inżynierski Pragmatyzm ponad Hype.",
            description: "Nie jestem tylko koderem. Z ponad dekadą doświadczenia w mechanice i zarządzaniu produkcją, rozumiem, że software to tylko narzędzie do rozwiązywania problemów biznesowych. Moja droga od naprawy ciężkich maszyn do architektury klastrów Kubernetes daje mi unikalną przewagę: wiem, jak rzeczy działają od środka.",
            differentiatorTitle: "Niezawodność i Automatyzacja",
            differentiator: "Nie buduję przekomplikowanych rozwiązań. Buduję niezawodne, bezpieczne i zautomatyzowane systemy, które napędzają efektywność – czy to na linii produkcyjnej, czy w klastrze Google Cloud.",
            image: asset("img/industrial.webp")
        },
        projects: {
            title: "Zrealizowane projekty",
            labels: { challenge: "Wyzwanie", solution: "Rozwiązanie", result: "Wynik" },
            items: [
                {
                    id: '1',
                    title: "Bezpieczna Platforma Kontenerowa Multi-Tenant na Google Cloud (GKE)",
                    subtitle: "DevSecOps • Kubernetes",
                    challenge: "Migracja systemu ERP z awaryjnej infrastruktury VPS (Single Point of Failure, problemy z backupami) do skalowalnego środowiska chmurowego.",
                    solution: "Zaprojektowanie klastra GKE od zera. Wdrożenie HashiCorp Vault do zarządzania sekretami, polityk sieciowych Calico (Default Deny) oraz WAF na warstwie Ingress. Automatyzacja wdrażania za pomocą skryptów Helm i Bash.",
                    tech: ["Kubernetes", "DevSecOps", "GKE", "Terraform", "Vault"],
                    result: "Usunięcie pojedynczego punktu awarii VPS: HA control plane, automatyczne backupy/DR i utwardzony, kontrolowany politykami klaster.",
                    iconName: 'Cloud',
                    image: asset("img/gke.webp")
                },
                {
                    id: '8',
                    title: "AI, które z maili z zamówieniami przygotowuje propozycje zamówień w ERP",
                    subtitle: "AI • Automatyzacja procesów",
                    challenge: "Handlowcy ręcznie przepisywali zamówienia z maili do systemu ERP.",
                    solution: "Treść maila czyta i wyciąga z niej pozycje model chmurowy (Gemini). Hostowany we własnym zakresie model decyzyjny Basal dobiera produkty z katalogu i podaje pewność dopasowania. Powstaje propozycja zamówienia (ZK): handlowiec dostaje prywatne powiadomienie, a dokument w systemie sprzedażowym powstaje dopiero po jego kliknięciu.",
                    tech: ["Basal", "Gemini", "NestJS", "PostgreSQL"],
                    result: "Działa jako pilotaż. Dopasowanie produktów robi model decyzyjny działający na firmowym sprzęcie, a żadne zamówienie nie powstaje bez zatwierdzenia przez człowieka.",
                    iconName: 'Bot',
                    image: asset("img/services/automation.webp")
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
                    image: asset("img/anpr.webp")
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
                    image: asset("img/ai.webp")
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
                    image: asset("img/mobile.webp")
                },
                {
                    id: '5',
                    title: "Zaawansowany System Ekstrakcji Faktur z Logiką 'Prompt-per-Vendor'",
                    subtitle: "AI • Computer Vision",
                    challenge: "Niska skuteczność klasycznych OCR (Tesseract) przy polskich fakturach i halucynacje modeli LLM przy analizie całych dokumentów.",
                    solution: "Odejście od OCR na rzecz analizy surowego PDF przez LLM. Opracowanie systemu dynamicznych promptów dobieranych na podstawie rozpoznanego NIP-u wystawcy faktury.",
                    tech: ["AI", "Computer Vision", "R&D", "Process Automation"],
                    result: "Wyraźna redukcja ręcznych korekt względem klasycznego OCR (wyniki wewnętrzne, nie audytowany benchmark).",
                    iconName: 'Brain',
                    image: asset("img/invoice.webp")
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
                    image: asset("img/chat.webp")
                },
                {
                    id: '7',
                    title: "Sandbox Wiedzy AI",
                    subtitle: "RAG • Osobiste AI Lab",
                    challenge: "Tymczasowe środowisko RAG do eksploracji wiedzy",
                    solution: "Prywatne 24-godzinne środowisko, w którym możesz przesyłać dokumenty (PDF, TXT, MD) i rozmawiać z AI, które odpowiada wyłącznie na podstawie przesłanych treści. Wykorzystuje bazę wektorową Qdrant, Gemini AI oraz uwierzytelnianie Firebase z anonimowym logowaniem.",
                    tech: ["RAG", "Qdrant", "Gemini AI", "Firebase Auth", "Vector Search"],
                    result: "Bezpieczne, izolowane środowisko do eksperymentowania z technologią RAG na własnych dokumentach.",
                    iconName: 'FlaskConical',
                    image: asset("img/airag.jpg"),
                    link: '/lab',
                    image: asset("img/airag.webp"),
                    languageBadge: 'pl'
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
            title: "Co mogę dla Ciebie zrobić",
            deliverablesLabel: "Co dostajesz",
            firstStepLabel: "Zaczynamy od",
            cta: "Zapytaj o tę usługę",
            items: [
                {
                    title: "Migracja do chmury i Kubernetes",
                    description: "Przenoszę aplikacje z VPS lub własnej serwerowni na Google Cloud (GKE albo Cloud Run). Cała infrastruktura jest zapisana w kodzie, a każda zmiana ma plan wycofania.",
                    deliverables: [
                        "Audyt obecnej infrastruktury i jej kosztów",
                        "Infrastruktura w Terraformie, do odtworzenia jednym poleceniem",
                        "CI/CD bez kluczy serwisowych (Workload Identity)",
                        "Monitoring, logi i alerty (Prometheus, Grafana, Loki)",
                        "Dokumentacja i przekazanie Twojemu zespołowi"
                    ],
                    firstStep: "Audyt i plan migracji",
                    iconName: "Cloud",
                    image: asset("img/services/cloud.webp")
                },
                {
                    title: "Integracja urządzeń przemysłowych",
                    description: "Podłączam wagi, kamery, czytniki i drukarki do systemów ERP i aplikacji webowych, także gdy urządzenie zna tylko RS232 albo Modbus.",
                    deliverables: [
                        "Rozpoznanie urządzeń i ich protokołów",
                        "Oprogramowanie pośredniczące z API dla Twojego systemu",
                        "Podgląd danych na żywo",
                        "Aplikacja na Androida, gdy proces tego wymaga",
                        "Instrukcja obsługi i wsparcie po wdrożeniu"
                    ],
                    firstStep: "Rozpoznanie urządzeń i protokołów",
                    iconName: "Wifi",
                    image: asset("img/services/iot.webp")
                },
                {
                    title: "Prywatne AI i bazy wiedzy (RAG)",
                    description: "Asystent AI, który odpowiada na podstawie Twoich dokumentów. Dane mogą zostać na Twojej infrastrukturze, bez wysyłania ich do publicznych modeli.",
                    deliverables: [
                        "Analiza dokumentów i przypadków użycia",
                        "Baza wiedzy z wyszukiwaniem semantycznym",
                        "Model lokalny (Ollama) albo chmurowy (Gemini), Ty wybierasz",
                        "Integracja ze Slackiem, stroną lub systemem firmowym",
                        "Pomiar jakości odpowiedzi i kosztów"
                    ],
                    firstStep: "Warsztat i prototyp na Twoich dokumentach",
                    iconName: "Brain",
                    image: asset("img/services/rag.webp")
                },
                {
                    title: "Automatyzacja pracy biurowej z AI",
                    description: "Automatyzuję powtarzalną pracę biurową: rozpoznawanie zamówień w mailach, odczyt faktur, uzupełnianie danych w ERP. Modele dobieram do wrażliwości danych: lokalne tam, gdzie dane nie mogą wyjść z firmy, chmurowe tam, gdzie to dopuszczalne.",
                    deliverables: [
                        "Przegląd procesów i wybór tych, które opłaca się automatyzować",
                        "Modele dobrane do wrażliwości danych: lokalne albo chmurowe",
                        "Integracja z pocztą, ERP lub arkuszami",
                        "Model podaje, jak bardzo jest pewny, a niepewne przypadki trafiają do człowieka",
                        "Pomiar oszczędzonego czasu"
                    ],
                    firstStep: "Przegląd procesów i pilotaż na jednym z nich",
                    iconName: "Bot",
                    image: asset("img/services/automation.webp")
                }
            ]
        },
        process: {
            title: "Jak wygląda współpraca",
            steps: [
                { title: "Bezpłatna rozmowa", description: "30 minut. Opowiadasz o problemie, ja mówię wprost, czy i jak mogę pomóc." },
                { title: "Zakres i wycena", description: "Dostajesz pisemny zakres prac, harmonogram i cenę." },
                { title: "Realizacja", description: "Pracuję etapami. Po każdym etapie widzisz działający wynik." },
                { title: "Przekazanie i faktura", description: "Dokumentacja, omówienie z Twoim zespołem i faktura VAT wystawiona przez letmework.ai sp. z o.o." }
            ]
        },
        faq: {
            title: "Pytania przed rozmową",
            items: [
                { question: "Z kim podpisuję umowę?", answer: "Usługi wykonuję osobiście. Umowę i fakturę VAT wystawia letmework.ai sp. z o.o. Dla Ciebie to jedna umowa ze spółką i jeden inżynier, który robi robotę." },
                { question: "Ile to kosztuje?", answer: "Zależy od zakresu. Po bezpłatnej rozmowie dostajesz wycenę za konkretny efekt albo stawkę godzinową przy pracach ciągłych." },
                { question: "Czy pracujesz zdalnie?", answer: "Tak, większość prac wykonuję zdalnie. Przy integracji urządzeń pracę na miejscu ustalamy indywidualnie." },
                { question: "Co z poufnością?", answer: "Przed pierwszą rozmową techniczną możemy podpisać NDA. Proszę tylko o dostępy, których wymaga zlecenie." },
                { question: "Co po wdrożeniu?", answer: "Dostajesz kod i dokumentację. Możemy też umówić się na stałe wsparcie." }
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
                    description: "Przemysłowe podejście do niezawodności: idempotentny IaC, obserwowalność i DR — projektuję pod awarię, zamiast zakładać uptime.",
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
            cta: "Opowiedz, co chcesz zbudować.",
            sub: "Każde zapytanie czytam i odpisuję na nie osobiście.",
            buttons: { cv: "Portfolio Techniczne (PDF)", linkedin: "LinkedIn", github: "GitHub", email: "Napisz Email", tryLab: "Wypróbuj AI Lab (24h sesja)" },
            form: {
                name: "Imię i nazwisko",
                email: "E-mail firmowy",
                service: "Czego dotyczy zapytanie?",
                serviceOther: "Coś innego",
                message: "Opisz problem w kilku zdaniach",
                submit: "Wyślij zapytanie",
                sending: "Wysyłam...",
                success: "Dziękuję. Zapytanie do mnie dotarło, odpiszę mailem.",
                error: "Nie udało się wysłać. Napisz do mnie bezpośrednio:",
                privacy: "Dane z formularza wykorzystuję wyłącznie do odpowiedzi na to zapytanie."
            },
            linkedinUrl: "www.linkedin.com/in/konrad-sędkowski-329644176",
            githubUrl: "https://github.com/halo2008",
            emailUrl: "konrad.sedkowski@letmework.ai"
        },
        aiChat: {
            trigger: "Zapytaj AI o mnie",
            title: "Asystent Konrada",
            placeholder: "Zapytaj o Kubernetes, IoT lub AI...",
            initialMessage: "Cześć! Jestem Asystentem AI Konrada. Zapytaj mnie o projekty lub doświadczenie.",
            thinking: "Myślę...",
            error: "Błąd.",
            status: "Online",
            rateLimitNote: "Uwaga: Korzystam z darmowego API. Jeśli zobaczysz błąd 503, oznacza to, że osiągnięto limit zapytań. Spróbuj ponownie za minutę."
        },
        telemetry: {
            title: "Telemetria Infrastruktury na Żywo",
            description: "Metryki wydajności w czasie rzeczywistym bezpośrednio ze środowiska produkcyjnego, monitorowane przez Prometheus i Grafana."
        },
        nav: { home: "Home", projects: "Realizacje", resume: "O mnie", services: "Usługi", contact: "Kontakt" },
        footer: "Konrad Sędkowski. Umowy i faktury VAT: letmework.ai sp. z o.o.",
        home: {
            meta: {
                title: "Konrad Sędkowski: automatyzacja dla hurtowni i dystrybucji",
                skip: "Przejdź do treści",
                menu: "Menu",
                navLabel: "Główna"
            },
            nav: {
                services: "Usługi",
                about: "O mnie",
                work: "Realizacje",
                product: "System ERP",
                questions: "Pytania",
                groups: ["AI w firmie", "Infrastruktura"],
                hints: ["Zamówienia z maili bez przepisywania", "Odpowiedzi z procedur i instrukcji", "Migracja i utrzymanie systemów", "Wagi, kamery, drukarki etykiet"],
                language: { label: "English", code: "en" }
            },
            hero: {
                title: "Mniej ręcznej pracy w hurtowni",
                lead: "Ograniczam ręczną pracę przy zamówieniach, dokumentach i urządzeniach w sprzedaży i magazynie. Zaczynam od jednego procesu i programów, które firma już ma. Pierwsza rozmowa, 30 minut, jest bezpłatna.",
                primary: "Umów bezpłatną rozmowę",
                secondary: "Zobacz realizacje",
                inbox: {
                    label: "Panel zamówień z maili: cztery propozycje z pewnością dopasowania od 91 do 97 procent czekają na zatwierdzenie, jedna z pewnością 58 procent jest do sprawdzenia",
                    app: "Zamówienia z maili",
                    view: "Demo z pilotażu",
                    search: "Szukaj",
                    folders: [{ name: "Do zatwierdzenia", count: 4 }, { name: "Do sprawdzenia", count: 1 }, { name: "Zatwierdzone" }, { name: "Odrzucone" }],
                    columns: ["Nadawca i pozycje", "Pewność", "Akcja"],
                    approve: "Zatwierdź",
                    review: "Do sprawdzenia",
                    rows: [
                        { sender: "Hurtownia Przykładowa", items: "Rękawice nitrylowe M × 20 op., taśma pakowa × 12", match: 97 },
                        { sender: "Sklep Testowy", items: "Folia stretch × 6 rolek, karton 40×30×20 × 150", match: 94 },
                        { sender: "Piekarnia Przykładowa", items: "Worki papierowe × 500, „to co ostatnio”", match: 58, review: true },
                        { sender: "Warsztat Testowy", items: "Ręczniki papierowe × 24, mydło 5 l × 4", match: 96 },
                        { sender: "Firma Wzorcowa", items: "Etykiety termiczne 100×150 × 10 rolek", match: 91 }
                    ],
                    open: {
                        title: "Piekarnia Przykładowa: propozycja zamówienia",
                        mail: "„Poproszę worki papierowe 500 szt. i to co ostatnio.”",
                        fix: "Popraw pozycję",
                        lines: [
                            { name: "Worki papierowe 30×40 cm", qty: "500 szt.", match: 97 },
                            { name: "„to co ostatnio”: 2 pasujące produkty", qty: "?", match: 58, pick: "Wybierz produkt" }
                        ]
                    }
                }
            },
            services: {
                title: "Cztery usługi automatyzacji",
                lead: "Najpierw sprawdzam, co da się zrobić w programach, których już używacie.",
                items: [
                    { title: "Automatyzacja pracy biurowej", text: "Zamówienie z maila zamienia się w propozycję do zatwierdzenia zamiast w przepisywanie. Model lokalny albo chmurowy, zależnie od danych.", photo: { src: asset("assets/img/ai-office-automation.webp"), small: asset("assets/img/ai-office-automation-500.webp"), medium: asset("assets/img/ai-office-automation-960.webp"), alt: "Dłoń handlowca na myszce przed monitorem z listą zamówień z maili, część zatwierdzona, część czeka", width: 1280, height: 853 } },
                    { title: "Asystent AI z dokumentów firmy", text: "Pracownik pyta o procedurę albo ofertę i dostaje odpowiedź z dokumentów firmy. Dane mogą zostać na Waszych serwerach.", photo: { src: asset("assets/img/photo-f63536476.webp"), small: asset("assets/img/photo-f63536476-500.webp"), medium: asset("assets/img/photo-f63536476-960.webp"), alt: "Regały archiwum z opisanymi pudłami dokumentów", width: 1280, height: 903 } },
                    { title: "Chmura Google dla systemów firmy", text: "Przenoszę aplikacje firmy do chmury i je utrzymuję: kopie zapasowe, monitoring, plan wycofania zmian.", photo: { src: asset("assets/img/photo-f6212692-960.webp"), small: asset("assets/img/photo-f6212692-500.webp"), medium: asset("assets/img/photo-f6212692-960.webp"), alt: "Rzędy szaf serwerowych w jasnej hali centrum danych", width: 960, height: 640 } },
                    { title: "Urządzenia, które same zapisują dane", text: "Waga, kamera, czytnik albo drukarka etykiet zapisują dane same: bez kartki i bez drugiego wpisywania.", photo: { src: asset("assets/img/photo-f192577777.webp"), small: asset("assets/img/photo-f192577777-500.webp"), medium: asset("assets/img/photo-f192577777-960.webp"), alt: "Panel dotykowy sterowania zamontowany na stalowej szafie maszyny", width: 1280, height: 852 } }
                ]
            },
            product: {
                title: "ERP dla firm, gdy programy już nie wystarczają",
                lead: "Gdy dane są rozrzucone po programach i arkuszach, proponuję system, który współtworzę, w jednej z dwóch wersji: w chmurze letmework.ai, z aplikacją dla handlowców i asystentem Lemy, albo lokalnie, na Waszym serwerze, jako nakładka na Subiekt GT. Licencję prowadzi letmework.ai, ja go wdrażam.",
                tabs: ["Sprzedaż", "Magazyn", "Logistyka", "Asystent AI"],
                trackerTitle: "Aplikacja dla handlowców z asystentem głosowym Lemy",
                trackerText: "Handlowiec dyktuje notatkę po spotkaniu, a Lemy zapisuje ją w karcie klienta po jego „tak”. Połączenia i SMS-y z nowych numerów czekają na przypisanie do klienta jednym dotknięciem.",
                cta: "Umów pokaz systemu",
                topic: "System ERP i aplikacja Tracker",
                subiekt: "Wersja lokalna dla Subiekta GT"
            },
            statement: {
                label: "Wyniki z publicznych case study letmework.ai",
                before: "Zaczynałem przy maszynach: jako mechanik, operator i mistrz zmiany w fabrykach ceramiki. Dlatego zaczynam od tego, jak pracują ludzie, a nie od technologii. Systemy, które buduję, zdejmują z ludzi ",
                facts: [
                    { value: "8×", label: "więcej stałych klientów na handlowca w Ulamexie: do 300, osiem razy więcej niż wcześniej" },
                    { value: "ok. 10 tys. zł", label: "za sprzęt do magazynu w Ulamexie, zamiast ok. 1 mln zł za gotowy WMS" },
                    { value: "8 → 1", label: "narzędzi w obsłudze zamówienia w Marketstal, od importu po przyjęcie" }
                ],
                strong: "ręczną pracę",
                after: "."
            },
            process: {
                title: "Współpraca w 4 krokach",
                steps: [
                    { title: "Bezpłatna rozmowa, 30 minut", text: "Mówię wprost, czy i jak mogę pomóc." },
                    { title: "Analiza jednego procesu, bezpłatnie", text: "Mapa obecnej pracy, miejsca ręcznego przepisywania, dostęp do danych i plan pilotażu. Wynik zostaje u Was, nawet bez dalszego zlecenia." },
                    { title: "Pilotaż albo wdrożenie etapami", text: "Po każdym etapie widzisz działający wynik." },
                    { title: "Przekazanie i faktura", text: "Dokumentacja, omówienie z Twoim zespołem i faktura VAT od letmework.ai sp. z o.o." }
                ]
            },
            work: {
                title: "6 realizacji: problem i wynik",
                lead: "Każda zaczynała się od czynności, którą ktoś codziennie powtarzał ręcznie.",
                appsTitle: "Aplikacje dla handlowców i magazynu",
                open: "Zobacz ekran",
                close: "Zamknij",
                items: [
                    { title: "ERP przeniesiony do chmury Google", text: "Produkcja zeszła z wynajętych serwerów, a całe środowisko da się odtworzyć z repozytorium. Kopie zapasowe robią się same.", photo: { src: asset("assets/img/photo-f37336988.webp"), small: asset("assets/img/photo-f37336988-500.webp"), medium: asset("assets/img/photo-f37336988-960.webp"), alt: "Niebieskie kable sieciowe wpięte w przełącznik w szafie serwerowej", width: 1280, height: 720 } },
                    { title: "Waga dla TIR-ów z kamerami ANPR", text: "Kamera odczytuje tablicę, a masa trafia do ERP przy właściwej dostawie. Magazynier nie przepisuje kwitów, a obraz z kamer działa w przeglądarce.", photo: { src: asset("assets/img/ai-weighbridge.webp"), small: asset("assets/img/ai-weighbridge-500.webp"), medium: asset("assets/img/ai-weighbridge-960.webp"), alt: "Ciężarówka z naczepą na wadze samochodowej, kamera ANPR na słupie, szlaban i budka wagowa", width: 1280, height: 853 } },
                    { title: "AI przygotowuje zamówienia z maili", text: "Pilotaż: produkty dobiera model decyzyjny na firmowym sprzęcie. Żadne zamówienie nie powstaje bez zatwierdzenia przez handlowca.", photo: { src: asset("assets/img/photo-f51440522.webp"), small: asset("assets/img/photo-f51440522-500.webp"), medium: asset("assets/img/photo-f51440522-960.webp"), alt: "Otwarty laptop na drewnianym stole w biurze", width: 1280, height: 853 } },
                    { title: "Aplikacja CRM dla ponad 50 handlowców", text: "Aplikacja na Androida połączona z centralą sama zapisuje rozmowy z klientami. Kierownik widzi kontakty na bieżąco, bez ręcznych raportów.", photo: { src: asset("assets/img/ai-mobile-crm.webp"), small: asset("assets/img/ai-mobile-crm-500.webp"), medium: asset("assets/img/ai-mobile-crm-960.webp"), alt: "Dłonie handlowca ze smartfonem, na ekranie lista ostatnich połączeń z klientami", width: 1280, height: 853 } },
                    { title: "Etykiety z telefonu na drukarkach Zebra", text: "Napisałem sterownik do przenośnych drukarek, więc magazynier drukuje etykiety prosto z aplikacji w telefonie.", photo: { src: asset("assets/img/ai-label-printer.webp"), small: asset("assets/img/ai-label-printer-500.webp"), medium: asset("assets/img/ai-label-printer-960.webp"), alt: "Przenośna drukarka etykiet przy pasku pracownika magazynu, z wysuwającą się etykietą z kodem kreskowym", width: 1280, height: 853 } },
                    { title: "Asystent AI pisze oferty dla klientów", text: "Model zna historię zakupów klienta i proponuje produkty uzupełniające. Handlowiec dostaje gotowy szkic oferty, a model działa na serwerze firmy.", photo: { src: asset("assets/img/ai-sales-assistant.webp"), small: asset("assets/img/ai-sales-assistant-500.webp"), medium: asset("assets/img/ai-sales-assistant-960.webp"), alt: "Laptop w biurze handlowym ze szkicem maila z ofertą i kafelkami produktów", width: 1280, height: 853 } }
                ],
            },
            faq: {
                title: "5 pytań przed rozmową",
                link: "Napisz e-mail",
                items: [
                    { question: "Czy firma musi zmieniać system?", answer: "Nie. Zaczynam od programów, których używacie dziś. Nowy system proponuję tylko, gdy analiza pokaże, że jest potrzebny, i mówię wprost, że go współtworzę." },
                    { question: "Z kim firma podpisuje umowę?", answer: "Umowę i fakturę VAT wystawia letmework.ai sp. z o.o. Prace wykonuję osobiście." },
                    { question: "Ile kosztują usługi?", answer: "Zależy od zakresu: wycena za konkretny efekt albo stawka godzinowa." },
                    { question: "Co z poufnością danych firmy?", answer: "Przed pierwszą rozmową techniczną możemy podpisać umowę o poufności. Proszę tylko o dostępy, których wymaga zlecenie." },
                    { question: "Co firma dostaje po wdrożeniu?", answer: "Przy pracach na zamówienie: kod i dokumentację. Przy ERP: licencję letmework.ai. Możliwe też stałe wsparcie." }
                ]
            },
            about: {
                title: "Konrad Sędkowski, inżynier od automatyzacji",
                paragraphs: [
                    "Od 2025 roku prowadzę infrastrukturę i wydania platformy ERP, z której korzysta wiele firm. Przeniosłem ją z wynajętych serwerów do chmury Google.",
                    "Zbudowałem w niej między innymi wspólne logowanie, płatności online z BLIK-iem i fakturami, monitoring z alertami oraz śledzenie GPS floty.",
                    "Wcześniej przez blisko trzy lata rozwijałem system ERP firmy handlowej: aplikację dla ponad 50 handlowców, połączenie wag i kamer z systemem oraz asystenta sprzedaży opartego na AI."
                ],
                portraitAlt: "Konrad Sędkowski w skórzanej kurtce, w serwerowni"
            },
            call: {
                title: "Bezpłatna rozmowa, 30 minut",
                lead: "Każde zapytanie czytam sam i odpisuję mailem.",
                form: {
                    name: "Imię i nazwisko",
                    email: "E-mail firmowy",
                    service: "Temat rozmowy",
                    serviceOther: "Inny temat",
                    analysis: "Bezpłatna analiza jednego procesu",
                    message: "Opis problemu",
                    nameError: "Wpisz imię i nazwisko.",
                    emailError: "Wpisz adres e-mail ze znakiem @.",
                    messageError: "Opisz problem, co najmniej 10 znaków.",
                    fix: "Pola do poprawy: {n}.",
                    sending: "Wysyłam",
                    sent: "Twoja prośba o bezpłatną rozmowę dotarła. Odpiszę mailem.",
                    failed: "Nie udało się wysłać. Napisz bezpośrednio:",
                    privacy: "Dane z formularza wykorzystuję wyłącznie do odpowiedzi na to zapytanie."
                }
            },
            close: {
                title: "Pierwsza rozmowa trwa 30 minut",
                lead: "Jest bezpłatna, tak jak analiza jednego procesu, która po niej następuje."
            },
            footer: {
                lede: "Umowy i faktury VAT wystawia letmework.ai sp. z o.o.",
                columns: ["Oferta", "Informacje", "Kontakt", "Więcej"],
                lab: "Laboratorium AI",
                credits: "Zdjęcia: Wikimedia Commons i ilustracje AI"
            },
            consent: {
                text: "Statystyki odwiedzin Google Analytics włączam tylko za Twoją zgodą.",
                accept: "Włącz statystyki",
                reject: "Odrzuć statystyki",
                label: "Zgoda na statystyki"
            }
        },
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
                role: "Platform / DevOps Engineer",
                image: asset("portrait.webp"),
                linkedin: "www.linkedin.com/in/konrad-sędkowski-329644176"
            }
        }
    }
};
