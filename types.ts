export type Language = 'en' | 'pl';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  challenge: string;
  solution: string;
  tech: string[];
  result: string;
  iconName: 'Server' | 'Bot' | 'Shield' | 'Smartphone' | 'Brain';
  image?: string;
}

export interface TechCategory {
  category: string;
  items: string[];
  iconName: 'Cloud' | 'Lock' | 'Brain' | 'Code';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
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
  hero: {
    headline: string;
    subheadline: string;
    tags: string[];
    cta: string;
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
  nav: {
    philosophy: string;
    projects: string;
    contact: string;
  };
  footer: string;
}