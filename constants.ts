
import { Organization, Project, ProjectStatus, Role, TaskStatus, User, Lead } from './types';

export const MOCK_ORG: Organization = {
  id: 'org-1',
  name: 'ShipCode',
  primaryColor: '#dc2626', // Red 600
  settings: {
    taxRate: 0.15,
    currency: 'BRL',
  },
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Builder', role: Role.ADMIN, avatarUrl: 'https://picsum.photos/200/200?random=1' },
  { id: 'u2', name: 'Sarah PM', role: Role.MANAGER, avatarUrl: 'https://picsum.photos/200/200?random=2' },
  { id: 'u3', name: 'Mike Dev', role: Role.CONTRIBUTOR, avatarUrl: 'https://picsum.photos/200/200?random=3' },
  { id: 'u4', name: 'John Cliente', role: Role.CLIENT, avatarUrl: 'https://picsum.photos/200/200?random=4' },
];

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', clientName: 'FinTech Corp', projectName: 'MVP Carteira Digital', budget: 45000, probability: 75, status: 'QUALIFIED', source: 'REFERRAL', createdAt: '2023-10-15' },
  { id: 'l2', clientName: 'EcoStart', projectName: 'Dashboard de Carbono', budget: 22000, probability: 40, status: 'CONTACTED', source: 'MANUAL', createdAt: '2023-10-20' },
  { id: 'l3', clientName: 'VarejoGigante', projectName: 'Redesign E-commerce', budget: 120000, probability: 90, status: 'CONVERTED', source: 'REFERRAL', createdAt: '2023-09-01' },
  { id: 'l4', clientName: 'AutoMotive AI', projectName: 'Fleet Tracking System', budget: 85000, probability: 20, status: 'NEW', source: 'CAMPAIGN_LINKEDIN', createdAt: '2023-10-25' },
  { id: 'l5', clientName: 'Dr. Consultas', projectName: 'App Agendamento', budget: 35000, probability: 15, status: 'NEW', source: 'CAMPAIGN_ADS', createdAt: '2023-10-26' },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Redesign E-commerce',
    clientName: 'VarejoGigante',
    status: ProjectStatus.BUILD,
    description: 'Reformulação completa do frontend monolítico legado para uma arquitetura combinável usando Next.js e Shopify Hydrogen.',
    contract: {
      id: 'c1',
      status: 'SIGNED',
      content: 'Este Contrato Mestre de Serviços ("Contrato") é celebrado entre...',
      totalValue: 120000,
      signedAt: '2023-09-15'
    },
    teamIds: ['u1', 'u2', 'u3'],
    financials: [
      { id: 'f1', description: 'Taxa Inicial de Discovery', amount: 15000, type: 'REVENUE', category: 'FIXED_FEE' },
      { id: 'f2', description: 'Instâncias Cloud Dev', amount: 450, type: 'COST', category: 'INFRA' },
      { id: 'f3', description: 'Pagamento Marco 1', amount: 35000, type: 'REVENUE', category: 'FIXED_FEE' },
      { id: 'f4', description: 'Horas Dev Frontend (Out)', amount: 6500, type: 'COST', category: 'LABOR' },
    ],
    tasks: [
      { id: 't1', title: 'Configurar Pipelines CI/CD', status: TaskStatus.DONE, assigneeId: 'u1' },
      { id: 't2', title: 'Migrar Catálogo de Produtos', status: TaskStatus.IN_PROGRESS, assigneeId: 'u3' },
      { id: 't3', title: 'Implementação do Design System', status: TaskStatus.IN_PROGRESS, assigneeId: 'u3' },
      { id: 't4', title: 'Integração de Autenticação', status: TaskStatus.TODO, assigneeId: 'u3' },
    ]
  },
  {
    id: 'p2',
    name: 'App HealthTrack',
    clientName: 'MediCare Inc.',
    status: ProjectStatus.DISCOVERY,
    description: 'Aplicativo iOS nativo para monitoramento de sinais vitais de pacientes em tempo real.',
    teamIds: ['u2', 'u3'],
    financials: [
       { id: 'f5', description: 'Depósito de Discovery', amount: 5000, type: 'REVENUE', category: 'FIXED_FEE' },
    ],
    tasks: [
      { id: 't5', title: 'Análise de Concorrentes', status: TaskStatus.DONE, assigneeId: 'u2' },
      { id: 't6', title: 'Wireframing dos Fluxos Principais', status: TaskStatus.IN_PROGRESS, assigneeId: 'u2' },
    ]
  }
];

export const CONTRACT_TEMPLATE = `
# CONTRATO MESTRE DE PRESTAÇÃO DE SERVIÇOS

**Entre:** {ORG_NAME}
**E:** {CLIENT_NAME}

## 1. Escopo do Trabalho
A Contratada concorda em realizar os serviços descritos na Proposta de Projeto anexa ({PROJECT_NAME}).

## 2. Remuneração
O Cliente concorda em pagar a quantia total de {TOTAL_VALUE} de acordo com o cronograma de pagamentos.

## 3. Propriedade Intelectual
Após o pagamento integral, todos os entregáveis tornar-se-ão propriedade exclusiva do Cliente.

## 4. Confidencialidade
Ambas as partes concordam em manter a confidencialidade das informações proprietárias.

---
*Gerado por {ORG_NAME} OS*
`;
