export type Language = 'en' | 'pl';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  challenge: string;
  solution: string;
  tech: string[];
  result: string;
  iconName: 'Server' | 'Bot' | 'Shield' | 'Smartphone' | 'Brain' | 'Rocket' | 'Wifi' | 'Cloud';
  image?: string;
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
  iconName: string;
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

export interface PortfolioContent {
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
  services: { // New
    title: string;
    items: ServiceItem[];
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
      email: string;
    };
    linkedinUrl: string;
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