import { apiRequest } from "./queryClient";

// Chat with the AI assistant
export async function chatWithAI(userId: number, message: string, conversationId?: number) {
  const response = await apiRequest("POST", "/api/ai/chat", {
    userId,
    message,
    conversationId,
  });

  return await response.json();
}

// Generate flashcards on a specific topic
export async function generateFlashcards(userId: number, topic: string, materialId?: number, count: number = 5) {
  const response = await apiRequest("POST", "/api/ai/flashcards", {
    userId,
    topic,
    materialId,
    count,
  });

  return await response.json();
}

// Summarize PDF content
export async function summarizeContent(userId: number, materialId: number, content: string) {
  const response = await apiRequest("POST", "/api/ai/summarize", {
    userId,
    materialId,
    content,
  });

  return await response.json();
}

// Generate a personalized study plan
export async function generateStudyPlan(userId: number, topics: string[], durationDays: number, hoursPerDay: number) {
  const response = await apiRequest("POST", "/api/ai/study-plan", {
    userId,
    topics,
    durationDays,
    hoursPerDay,
  });

  return await response.json();
}
