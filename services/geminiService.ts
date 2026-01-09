import { GoogleGenerativeAI } from "@google/generative-ai";
import { Project } from "../types";

// Initialize Gemini Client
// In a real app, ensure VITE_GEMINI_API_KEY is defined in .env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

const GEN_AI_MODELS = [
  "gemini-2.5-flash", // Cutting edge (Try this first, likely less crowded)
  "gemini-2.5-pro",   // Cutting edge Pro
  "gemini-2.0-flash", // Stable 2.0
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-lite-001",
  "gemini-2.0-flash-exp",
];

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithFallback(prompt: string, isJson: boolean = false): Promise<string> {
  let lastError = null;

  for (const modelName of GEN_AI_MODELS) {
    try {
      console.log(`🤖 Tentando modelo: ${modelName}...`);

      // Retry logic for 429/503 errors
      let attempts = 0;
      const maxRetries = 5; // Sustain retries for a reasonably long time

      while (attempts <= maxRetries) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: isJson ? { responseMimeType: "application/json" } : undefined
          });

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          if (text) return text; // Success!

        } catch (reqError: any) {
          // Check for Rate Limit (429) or Server Overload (503)
          if (reqError.message.includes("429") || reqError.status === 429 || reqError.status === 503) {
            attempts++;
            if (attempts > maxRetries) throw reqError;

            // Smoother Backoff: 3s, 6s, 12s, 24s, 30s
            let waitTime = 3000 * Math.pow(2, attempts - 1);
            if (waitTime > 30000) waitTime = 30000; // Cap at 30s

            console.warn(`⏳ [${modelName}] Limite de requisições (429). Aguardando ${waitTime / 1000}s para tentar novamente (${attempts}/${maxRetries})...`);
            await delay(waitTime);
            continue;
          } else {
            throw reqError;
          }
        }
        break;
      }

    } catch (error: any) {
      console.warn(`⚠️ Falha no modelo ${modelName}:`, error.message);
      lastError = error;
    }
  }

  throw lastError || new Error("Serviço temporariamente indisponível (Muitos acessos). Tente novamente em alguns minutos.");
}

export const getPMAssistance = async (
  query: string,
  currentProject?: Project
): Promise<string> => {
  if (!apiKey) {
    return "⚠️ Configuração Necessária: Adicione VITE_GEMINI_API_KEY no seu arquivo .env";
  }

  try {
    let contextPrompt = `Você é um assistente especialista em Gestão de Projetos para um sistema operacional de agências digitais chamado "ShipCode OS". 
    Seu tom é calmo, profissional, técnico e confiável — como um mentor experiente. 
    Mantenha as respostas concisas e acionáveis. Use Markdown para formatação.
    Responda sempre em Português do Brasil.`;

    if (currentProject) {
      contextPrompt += `
      
      Contexto do Projeto Atual:
      Nome: ${currentProject.name}
      Cliente: ${currentProject.clientName}
      Status: ${currentProject.status}
      Descrição: ${currentProject.description}
      Tamanho da Equipe: ${currentProject.teamIds.length}
      Financeiro: ${currentProject.financials.length} itens registrados.
      Tarefas: ${currentProject.tasks.length} tarefas no total.
      Status do Contrato: ${currentProject.contract?.status || 'Sem contrato'}.
      `;
    }

    const fullPrompt = `${contextPrompt}\n\nConsulta do Usuário: ${query}`;

    return await generateWithFallback(fullPrompt, false);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Encontrei um erro ao processar sua solicitação. Verifique sua chave API.";
  }
};

export const getProjectSuggestions = async (
  projectName: string,
  clientName: string,
  description: string
) => {
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing");
    return null;
  }

  try {
    const prompt = `Atue como um Arquiteto de Soluções Sênior e CTO de uma agência de software.
      Analise o seguinte projeto e sugira uma stack tecnológica ideal, uma estimativa de orçamento e um prazo de entrega realista.
      
      Cliente: ${clientName}
      Projeto: ${projectName}
      Briefing: ${description}
      
      Responda EXCLUSIVAMENTE em JSON válido, sem markdown code blocks, seguindo este schema:
      {
        "architecture": "string (stack recomendada com visual markdown)",
        "estimatedBudget": number (valor númerico),
        "estimatedTimeline": "string (ex: 3 meses)",
        "reasoning": "string (justificativa)"
      }`;

    const text = await generateWithFallback(prompt, false); // Intentionally false to handle JSON stripping manually

    // Sanitize json code blocks if present
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return null;
  }
};