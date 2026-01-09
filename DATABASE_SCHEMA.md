# 📊 ShipeCode - Database Schema Documentation

> **Última Atualização:** Janeiro 2026  
> **Banco de Dados:** Supabase (PostgreSQL)

---

## 📋 Resumo das Tabelas

| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `profiles` | Usuários do sistema | ✅ |
| `organizations` | Agência/Empresa | ✅ |
| `projects` | Projetos de desenvolvimento | ✅ |
| `leads` | Pipeline de vendas | ✅ |
| `tasks` | Tarefas dos projetos | ✅ |
| `financial_items` | Receitas e custos | ✅ |
| `contracts` | Contratos dos projetos | ✅ |
| `project_members` | Alocação de equipe | ✅ |
| `work_logs` | Registro de horas | ✅ |
| `notifications` | Notificações do sistema | ✅ |
| `feedbacks` | Feedback de clientes | ✅ |
| `documents` | Arquivos anexados | ✅ |
| `expenses` | Despesas gerais | ✅ |
| `kpi_targets` | Metas de KPI | ✅ |
| `ai_chat_sessions` | Sessões do assistente IA | ✅ |
| `ai_chat_messages` | Mensagens do chat IA | ✅ |
| `integrations` | Integrações externas | ✅ |
| `task_comments` | Comentários em tarefas | ✅ |

---

## 🔐 Enums (Tipos Customizados)

```sql
-- Roles de usuário
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'CONTRIBUTOR', 'CLIENT');

-- Status de projeto
CREATE TYPE project_status AS ENUM ('LEAD', 'DISCOVERY', 'CONTRACTING', 'BUILD', 'QA', 'DEPLOYED');

-- Status de tarefa
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');

-- Prioridade de tarefa
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Status de lead
CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- Fonte de lead
CREATE TYPE lead_source AS ENUM ('MANUAL', 'CAMPAIGN_LINKEDIN', 'CAMPAIGN_ADS', 'REFERRAL', 'WEBSITE');

-- Tipo financeiro
CREATE TYPE financial_type AS ENUM ('COST', 'REVENUE');

-- Categoria financeira
CREATE TYPE financial_category AS ENUM ('LABOR', 'INFRA', 'TOOL', 'FIXED_FEE');

-- Status de contrato
CREATE TYPE contract_status AS ENUM ('DRAFT', 'SENT', 'SIGNED');

-- Status de feedback
CREATE TYPE feedback_status AS ENUM ('PENDING', 'REVIEWED', 'CONVERTED');

-- Tipo de notificação
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');

-- Provedor de integração
CREATE TYPE integration_provider AS ENUM ('GITHUB', 'SLACK', 'JIRA', 'TRELLO');
```

---

## 📝 Detalhamento das Tabelas

### `profiles`
Usuários autenticados do sistema.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK, FK → auth.users |
| `name` | text | NO | Nome completo |
| `email` | text | YES | Email |
| `role` | user_role | YES | Papel no sistema |
| `avatar_url` | text | YES | URL do avatar |
| `github_url` | text | YES | Perfil GitHub |
| `linkedin_url` | text | YES | Perfil LinkedIn |
| `created_at` | timestamptz | NO | Data de criação |
| `updated_at` | timestamptz | NO | Última atualização |

**RLS:**
- `SELECT`: Todos autenticados podem ver
- `UPDATE`: Próprio perfil OU Admin
- `DELETE`: Apenas Admin

---

### `organizations`
Dados da agência/empresa.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `name` | text | NO | Nome da organização |
| `logo_url` | text | YES | URL do logo |
| `primary_color` | text | YES | Cor primária (#hex) |
| `settings` | jsonb | YES | Configurações (taxRate, currency) |
| `created_at` | timestamptz | NO | Data de criação |
| `updated_at` | timestamptz | NO | Última atualização |

---

### `projects`
Projetos de desenvolvimento.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `organization_id` | uuid | NO | FK → organizations |
| `lead_id` | uuid | YES | FK → leads (origem) |
| `name` | text | NO | Nome do projeto |
| `client_name` | text | NO | Nome do cliente |
| `description` | text | YES | Descrição |
| `status` | project_status | YES | Status atual |
| `start_date` | date | YES | Data de início |
| `target_date` | date | YES | Data alvo de entrega |
| `created_at` | timestamptz | NO | Data de criação |
| `updated_at` | timestamptz | NO | Última atualização |

**RLS:**
- Admin/Manager: Acesso total
- Contributor: Apenas projetos onde está alocado

---

### `leads`
Pipeline de vendas.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | YES | FK → profiles (dono) |
| `client_name` | text | NO | Nome do cliente |
| `project_name` | text | NO | Nome do projeto |
| `budget` | numeric | NO | Orçamento estimado |
| `probability` | integer | YES | Probabilidade 0-100 |
| `status` | lead_status | YES | Status no funil |
| `source` | lead_source | YES | Origem do lead |
| `notes` | text | YES | Observações |
| `created_at` | timestamptz | NO | Data de criação |
| `updated_at` | timestamptz | NO | Última atualização |

**RLS:**
- Admin/Manager: Vê todos
- Contributor: Apenas próprios leads

---

### `tasks`
Tarefas dos projetos.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `project_id` | uuid | NO | FK → projects |
| `assignee_id` | uuid | YES | FK → profiles |
| `title` | text | NO | Título da tarefa |
| `description` | text | YES | Descrição |
| `status` | task_status | YES | Status |
| `priority` | task_priority | YES | Prioridade |
| `due_date` | timestamptz | YES | Data de entrega |
| `created_at` | timestamptz | NO | Data de criação |
| `updated_at` | timestamptz | NO | Última atualização |

---

### `financial_items`
Itens financeiros (custos/receitas).

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `project_id` | uuid | NO | FK → projects |
| `description` | text | NO | Descrição do item |
| `amount` | numeric | NO | Valor |
| `type` | financial_type | NO | COST ou REVENUE |
| `category` | financial_category | YES | Categoria |
| `created_at` | timestamptz | NO | Data de criação |
| `updated_at` | timestamptz | NO | Última atualização |

**RLS:** Apenas Admin/Manager

---

### `work_logs`
Registro de horas trabalhadas.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `profile_id` | uuid | YES | FK → profiles |
| `project_id` | uuid | YES | FK → projects |
| `hours_worked` | numeric | NO | Horas trabalhadas |
| `tasks_completed` | integer | YES | Tarefas concluídas |
| `efficiency_score` | numeric | YES | Score de eficiência |
| `log_date` | date | YES | Data do registro |
| `notes` | text | YES | Observações |
| `created_at` | timestamptz | YES | Data de criação |

**RLS:**
- `SELECT`: Todos autenticados
- `INSERT/UPDATE`: Próprios logs

---

### `notifications`
Sistema de notificações.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `user_id` | uuid | NO | FK → profiles |
| `title` | text | NO | Título |
| `message` | text | YES | Mensagem |
| `type` | notification_type | YES | Tipo (info/success/warning/error) |
| `read` | boolean | YES | Lida? |
| `link` | text | YES | Link de ação |
| `created_at` | timestamptz | NO | Data de criação |

**⚠️ Atenção:** Coluna é `read`, NÃO `is_read`

---

### `project_members`
Alocação de equipe em projetos.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `project_id` | uuid | NO | PK, FK → projects |
| `user_id` | uuid | NO | PK, FK → profiles |
| `role` | text | YES | Papel no projeto |

---

### `contracts`
Contratos dos projetos.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `project_id` | uuid | NO | FK → projects |
| `status` | contract_status | YES | Status do contrato |
| `content` | text | YES | Conteúdo/termos |
| `total_value` | numeric | YES | Valor total |
| `signed_at` | timestamptz | YES | Data de assinatura |
| `created_at` | timestamptz | NO | Data de criação |
| `updated_at` | timestamptz | NO | Última atualização |

---

### `feedbacks`
Feedback de clientes.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `project_id` | uuid | NO | FK → projects |
| `client_name` | text | YES | Nome do cliente |
| `message` | text | NO | Mensagem |
| `screenshots` | jsonb | YES | Array de URLs |
| `status` | feedback_status | YES | Status |
| `created_at` | timestamptz | NO | Data de criação |
| `updated_at` | timestamptz | NO | Última atualização |

---

### `expenses`
Despesas gerais da agência.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `description` | text | NO | Descrição |
| `amount` | numeric | NO | Valor |
| `category` | text | NO | Categoria |
| `date` | date | YES | Data da despesa |
| `created_by` | uuid | YES | FK → profiles |
| `created_at` | timestamptz | YES | Data de criação |

**RLS:** Apenas Admin/Manager

---

### `kpi_targets`
Metas de KPI.

| Coluna | Tipo | Null | Descrição |
|--------|------|------|-----------|
| `id` | uuid | NO | PK |
| `metric_name` | text | NO | Nome da métrica |
| `target_value` | numeric | NO | Valor alvo |
| `period` | text | YES | Período (mensal, trimestral) |
| `created_at` | timestamptz | YES | Data de criação |
| `updated_at` | timestamptz | YES | Última atualização |

---

### `ai_chat_sessions` / `ai_chat_messages`
Histórico do assistente IA.

**Sessions:**
| Coluna | Tipo | Null |
|--------|------|------|
| `id` | uuid | NO |
| `user_id` | uuid | NO |
| `project_id` | uuid | YES |
| `title` | text | YES |
| `created_at` | timestamptz | NO |

**Messages:**
| Coluna | Tipo | Null |
|--------|------|------|
| `id` | uuid | NO |
| `session_id` | uuid | NO |
| `role` | text | NO |
| `content` | text | NO |
| `created_at` | timestamptz | NO |

---

## 🔒 Políticas RLS Ativas

```sql
-- Exemplo de verificação
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

| Tabela | Política | Operação |
|--------|----------|----------|
| profiles | Users can update own profile | UPDATE |
| profiles | Admins can delete any profile | DELETE |
| leads | Admins/Managers View All Leads | ALL |
| leads | Users View/Edit Own Leads | ALL |
| projects | Project Members View Assigned | SELECT |
| financial_items | Admins/Managers Manage Financials | ALL |
| work_logs | Allow users to log their own work | INSERT |

---

## ⚠️ Notas Importantes

1. **Coluna `read` em notifications**: O código deve usar `read`, NÃO `is_read`
2. **organization_id**: Apenas `projects` tem essa coluna. `tasks` e `financial_items` NÃO têm.
3. **user_id em leads**: Foi adicionado para rastrear dono do lead.
4. **session_id em ai_chat_messages**: É do tipo `uuid`, não `text`.
