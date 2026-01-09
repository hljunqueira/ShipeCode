import { ProjectStatus } from './types';

/**
 * Template de contrato padrão
 * Usado para gerar contratos de projetos
 */
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

/**
 * Fases do projeto em ordem
 */
export const PROJECT_PHASES = [
  ProjectStatus.LEAD,
  ProjectStatus.DISCOVERY,
  ProjectStatus.CONTRACTING,
  ProjectStatus.BUILD,
  ProjectStatus.QA,
  ProjectStatus.DEPLOYED
];

/**
 * Labels em português para status de projeto
 */
export const PROJECT_STATUS_LABELS: Record<string, string> = {
  [ProjectStatus.LEAD]: 'Lead',
  [ProjectStatus.DISCOVERY]: 'Descoberta',
  [ProjectStatus.CONTRACTING]: 'Contrato',
  [ProjectStatus.BUILD]: 'Desenvolvimento',
  [ProjectStatus.QA]: 'Testes',
  [ProjectStatus.DEPLOYED]: 'Entregue',
};

/**
 * Labels em português para status de lead
 */
export const LEAD_STATUS_LABELS: Record<string, string> = {
  'NEW': 'Novo',
  'CONTACTED': 'Contatado',
  'QUALIFIED': 'Qualificado',
  'CONVERTED': 'Convertido',
  'LOST': 'Perdido',
};

/**
 * Configuração da aplicação
 */
export const APP_CONFIG = {
  version: '2.4.0',
  name: 'ShipeCode OS',
  description: 'Sistema Operacional para Agências Digitais',
};
