
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
  email?: string;
  githubUrl?: string;
  linkedinUrl?: string;
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
  source?: 'MANUAL' | 'CAMPAIGN_LINKEDIN' | 'CAMPAIGN_ADS' | 'REFERRAL' | 'WEBSITE';
  createdAt: string;
  notes?: string;
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
  description?: string;
  priority?: 'low' | 'medium' | 'high';
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

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'SALARY' | 'SOFTWARE' | 'MARKETING' | 'OFFICE' | 'OTHER';
  date: string;
}

export interface WorkLog {
  id: string;
  profile_id: string;
  project_id?: string;
  hours_worked: number;
  tasks_completed: number;
  efficiency_score: number;
  log_date: string;
  notes?: string;
}

export interface KpiTarget {
  id: string;
  metric_name: string;
  target_value: number;
  period: string;
}
