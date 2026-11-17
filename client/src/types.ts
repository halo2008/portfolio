export type Language = 'en' | 'pl';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  challenge: string;
  solution: string;
  tech: string[];
  result: string;
  iconName: 'Server' | 'Bot' | 'Shield' | 'Smartphone' | 'Brain' | 'Rocket' | 'Wifi' | 'Cloud' | 'FlaskConical';
  image?: string;
  link?: string;
  languageBadge?: 'en' | 'pl';
}

export interface TimelineItem {
  id: string;
  period: string;
  role: string;
  company: string;
  description: string;
  details: string[]; // List of bullet points (e.g., "Security: Implemented Vault")
  isCurrent: boolean;
}

export interface ServiceItem {
  title: string;
  description: string;
  deliverables: string[];
  firstStep: string;
  iconName: string;
  image: string;
}

export interface BusinessValueItem {
  title: string;
  description: string;
  iconName: 'Zap' | 'ShieldCheck' | 'Layers' | 'TrendingUp';
}

export interface TechCategory {
  category: string;
  items: string[];
  iconName: 'Cloud' | 'Lock' | 'Brain' | 'Code' | 'Wifi';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Photo {
  src: string;
  small: string;
  medium: string;
  alt: string;
  width: number;
  height: number;
}

export interface PhotoRow {
  title: string;
  text: string;
  photo: Photo;
}

export interface InboxRow {
  sender: string;
  items: string;
  match: number;
  review?: boolean;
}

export interface Inbox {
  label: string;
  app: string;
  view: string;
  search: string;
  folders: { name: string; count?: number }[];
  columns: string[];
  approve: string;
  review: string;
  rows: InboxRow[];
  open: {
    title: string;
    mail: string;
    fix: string;
    lines: { name: string; qty: string; match: number; pick?: string }[];
  };
}

export interface HomeContent {
  meta: { title: string; skip: string; menu: string; navLabel: string };
  nav: {
    services: string;
    about: string;
    work: string;
    product: string;
    questions: string;
    groups: string[];
    hints: string[];
    language: { label: string; code: Language };
  };
  hero: { title: string; lead: string; primary: string; secondary: string; inbox: Inbox };
  services: { title: string; lead: string; items: PhotoRow[] };
  product: { title: string; lead: string; tabs: string[]; trackerTitle: string; trackerText: string; cta: string; topic: string };
  statement: { label: string; before: string; strong: string; after: string; facts: { label: string; value: string }[] };
  process: { title: string; steps: { title: string; text: string }[] };
  work: { title: string; lead: string; appsTitle: string; open: string; close: string; items: PhotoRow[] };
  faq: { title: string; link: string; items: { question: string; answer: string }[] };
  about: { title: string; paragraphs: string[]; portraitAlt: string };
  call: {
    title: string;
    lead: string;
    form: {
      name: string;
      email: string;
      service: string;
      serviceOther: string;
      message: string;
      nameError: string;
      emailError: string;
      messageError: string;
      fix: string;
      sending: string;
      sent: string;
      failed: string;
      privacy: string;
    };
  };
  close: { title: string; lead: string };
  footer: { lede: string; columns: string[]; lab: string; credits: string };
  consent: { text: string; accept: string; reject: string; label: string };
}

export interface PortfolioContent {
  home: HomeContent;
  name: string;
  title: string;
  availability: string; // New
  hero: {
    headline: string;
    subheadline: string;
    tags: string[];
    cta: string;
    ctaSecondary: string; // New
    profileImage: string;
  };
  philosophy: {
    title: string;
    description: string;
    differentiatorTitle: string;
    differentiator: string;
    image: string;
  };
  projects: {
    title: string;
    items: Project[];
    labels: {
      challenge: string;
      solution: string;
      result: string;
    }
  };
  timeline: {
    title: string;
    items: TimelineItem[];
  };
  services: {
    title: string;
    deliverablesLabel: string;
    firstStepLabel: string;
    cta: string;
    items: ServiceItem[];
  };
  process: {
    title: string;
    steps: { title: string; description: string }[];
  };
  faq: {
    title: string;
    items: { question: string; answer: string }[];
  };
  businessValue: {
    title: string;
    items: BusinessValueItem[];
  };
  techStack: {
    title: string;
    items: TechCategory[];
  };
  contact: {
    cta: string;
    sub: string;
    buttons: {
      cv: string;
      linkedin: string;
      github: string;
      email: string;
      tryLab: string;
    };
    form: {
      name: string;
      email: string;
      service: string;
      serviceOther: string;
      message: string;
      submit: string;
      sending: string;
      success: string;
      error: string;
      privacy: string;
    };
    linkedinUrl: string;
    githubUrl: string;
    emailUrl: string;
  };
  aiChat: {
    trigger: string;
    title: string;
    placeholder: string;
    initialMessage: string;
    thinking: string;
    error: string;
    status: string;
    rateLimitNote: string;
  };
  telemetry: {
    title: string;
    description: string;
  };
  landing: {
    hero: {
      headline: string;
      subheadline: string;
      cta: string;
      demoImage: string; // Screenshot of Slack Bot
    };
    howItWorks: {
      title: string;
      steps: {
        title: string;
        description: string;
        iconName: 'FileText' | 'Database' | 'Brain' | 'MessageSquare'; // Icons for Doc -> Qdrant -> Gemini -> Slack
      }[];
    };
    security: {
      title: string;
      description: string;
      features: string[]; // List of trust markers
    };
    creator: {
      title: string; // "About the Creator"
      bio: string;
      name: string;
      role: string;
      image: string;
      linkedin: string;
    };
  };
  nav: {
    home: string; // New
    projects: string; // Renamed logic (Case Studies)
    resume: string; // New
    services: string; // New
    contact: string;
    philosophy?: string; // Optional or removed? Keeping it for types safety if used elsewhere or removing if not needed. Removing philosophy from Nav as requested.
  };
  footer: string;
}