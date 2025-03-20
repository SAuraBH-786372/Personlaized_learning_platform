import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Environment variable check
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
const hasGeminiKey = !!process.env.GEMINI_API_KEY;

// Initialize OpenAI client if key is available
const openai = hasOpenAIKey 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Initialize Gemini client if key is available
const geminiAI = hasGeminiKey
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
  : null;

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";
// Current Gemini model
const GEMINI_MODEL = "gemini-1.5-pro";

// Check if we can use AI services
export function hasAIServices(): boolean {
  return hasOpenAIKey || hasGeminiKey;
}

// Get the active AI service name
export function getActiveAIService(): string {
  if (hasOpenAIKey) return "OpenAI";
  if (hasGeminiKey) return "Gemini";
  return "None";
}

// Chat completion with fallback
export async function chatCompletion(messages: Array<{role: string, content: string}>) {
  // Try OpenAI first if available
  if (openai) {
    try {
      const formattedMessages = messages.map(m => ({
        role: m.role === "system" ? "assistant" : m.role as "user" | "assistant",
        content: m.content
      }));

      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: formattedMessages,
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI error, trying fallback:", error);
      // If OpenAI fails, and we have Gemini, use it as fallback
      if (geminiAI) {
        return geminiChatCompletion(messages);
      }
      throw error;
    }
  } 
  // If no OpenAI key, try Gemini
  else if (geminiAI) {
    return geminiChatCompletion(messages);
  } 
  // No AI services available
  else {
    throw new Error("No AI service available. Configure either OPENAI_API_KEY or GEMINI_API_KEY.");
  }
}

// Chat completion with JSON response
export async function chatCompletionJSON<T>(messages: Array<{role: string, content: string}>): Promise<T> {
  // Try OpenAI first if available
  if (openai) {
    try {
      const formattedMessages = messages.map(m => ({
        role: m.role === "system" ? "assistant" : m.role as "user" | "assistant",
        content: m.content
      }));

      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: formattedMessages,
        response_format: { type: "json_object" },
      });
      
      const content = response.choices[0].message.content || "{}";
      return JSON.parse(content) as T;
    } catch (error) {
      console.error("OpenAI error, trying fallback:", error);
      // If OpenAI fails, and we have Gemini, use it as fallback
      if (geminiAI) {
        return geminiChatCompletionJSON<T>(messages);
      }
      throw error;
    }
  } 
  // If no OpenAI key, try Gemini
  else if (geminiAI) {
    return geminiChatCompletionJSON<T>(messages);
  } 
  // No AI services available
  else {
    throw new Error("No AI service available. Configure either OPENAI_API_KEY or GEMINI_API_KEY.");
  }
}

// Helper function for Gemini chat completion
async function geminiChatCompletion(messages: Array<{role: string, content: string}>): Promise<string> {
  if (!geminiAI) {
    throw new Error("Gemini API key not configured");
  }
  
  try {
    // Map message roles to Gemini format
    const formattedMessages = convertMessagesToGeminiFormat(messages);
    
    // Get Gemini model
    const model = geminiAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    // Create chat and get response
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1) // All messages except the last one
    });
    
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response;
    
    return response.text();
  } catch (error) {
    console.error("Gemini chat completion error:", error);
    throw error;
  }
}

// Helper function for Gemini chat completion with JSON response
async function geminiChatCompletionJSON<T>(messages: Array<{role: string, content: string}>): Promise<T> {
  if (!geminiAI) {
    throw new Error("Gemini API key not configured");
  }
  
  try {
    // Add JSON instruction to the prompt
    const messagesWithFormat = [
      ...messages,
      {
        role: "user",
        content: "Please format your response as a valid JSON object with no explanations or text outside the JSON."
      }
    ];
    
    // Convert messages to Gemini format
    const formattedMessages = convertMessagesToGeminiFormat(messagesWithFormat);
    
    // Get Gemini model
    const model = geminiAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    // Create chat and get response
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1) // All messages except the last one
    });
    
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response;
    
    // Extract JSON from response
    const text = response.text();
    // Parse JSON, handling potential JSON formatting issues
    const jsonText = extractJsonFromText(text);
    
    return JSON.parse(jsonText) as T;
  } catch (error) {
    console.error("Gemini JSON completion error:", error);
    throw error;
  }
}

// Helper function to convert OpenAI message format to Gemini format
function convertMessagesToGeminiFormat(messages: Array<{role: string, content: string}>) {
  return messages.map(message => ({
    role: message.role === "user" ? "user" : "model",
    parts: [{ text: message.content }]
  }));
}

// Helper function to extract JSON from text that might contain non-JSON content
function extractJsonFromText(text: string): string {
  // Find the first opening brace
  const openingBraceIndex = text.indexOf('{');
  
  if (openingBraceIndex >= 0) {
    // Find the last closing brace
    const closingBraceIndex = text.lastIndexOf('}');
    
    if (closingBraceIndex > openingBraceIndex) {
      return text.substring(openingBraceIndex, closingBraceIndex + 1);
    }
  }
  
  // Fallback - return what we got (will likely cause JSON parse error if not valid)
  return text;
}