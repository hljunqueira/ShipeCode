
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  CLIENT = 'CLIENT',
}

export enum ProjectStatus {
  LEAD = 'LEAD',
  DISCOVERY = 'DISCOVERY',
  CONTRACTING = 'CONTRACTING',
  BUILD = 'BUILD',
  QA = 'QA',
  DEPLOYED = 'DEPLOYED',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  settings: {
    taxRate: number;
    currency: string;
  };
}

export interface Lead {
  id: string;
  clientName: string;
  projectName: string;
  budget: number;
  probability: number; // 0-100
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  source?: 'MANUAL' | 'CAMPAIGN_LINKEDIN' | 'CAMPAIGN_ADS' | 'REFERRAL';
  createdAt: string;
}

export interface Contract {
  id: string;
  status: 'DRAFT' | 'SENT' | 'SIGNED';
  content: string;
  totalValue: number;
  signedAt?: string;
}

export interface FinancialItem {
  id: string;
  description: string;
  amount: number;
  type: 'COST' | 'REVENUE';
  category: 'LABOR' | 'INFRA' | 'TOOL' | 'FIXED_FEE';
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  leadId?: string;
  description: string;
  startDate?: string;
  targetDate?: string;
  contract?: Contract;
  financials: FinancialItem[];
  tasks: Task[];
  teamIds: string[];
}
