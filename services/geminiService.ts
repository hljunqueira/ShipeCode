import { GoogleGenAI, Type } from "@google/genai";
import { Project } from "../types";

// Initialize Gemini Client
// In a real app, ensure process.env.API_KEY is defined.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const getPMAssistance = async (
  query: string,
  currentProject?: Project
): Promise<string> => {
  if (!apiKey) {
    return "Assistente IA indisponível. Por favor, configure a API_KEY.";
  }

  try {
    const modelId = 'gemini-3-flash-preview';
    
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

    const response = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
    });

    return response.text || "Não consegui gerar uma resposta neste momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Encontrei um erro ao processar sua solicitação. Por favor, tente novamente.";
  }
};

export const getProjectSuggestions = async (
  projectName: string,
  clientName: string,
  description: string
) => {
  if (!apiKey) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Atue como um Arquiteto de Soluções Sênior e CTO de uma agência de software.
      Analise o seguinte projeto e sugira uma stack tecnológica ideal, uma estimativa de orçamento e um prazo de entrega realista.
      
      Cliente: ${clientName}
      Projeto: ${projectName}
      Briefing: ${description}
      
      Responda em JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            architecture: {
              type: Type.STRING,
              description: "A stack recomendada, padrões de arquitetura e infraestrutura (ex: Frontend, Backend, Database, Cloud). Use Markdown bullet points."
            },
            estimatedBudget: {
              type: Type.NUMBER,
              description: "Valor sugerido para o projeto em Reais (apenas números)."
            },
            estimatedTimeline: {
              type: Type.STRING,
              description: "Tempo estimado de entrega (ex: '3 meses', '4 semanas')."
            },
            reasoning: {
              type: Type.STRING,
              description: "Breve justificativa técnica para as escolhas."
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return null;
  }
};