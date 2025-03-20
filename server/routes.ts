import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import { createHash } from "crypto";
import { 
  insertUserSchema, 
  insertStudyMaterialSchema, 
  insertStudySessionSchema,
  insertFlashcardSchema,
  insertMaterialSummarySchema,
  insertConversationSchema,
  insertUserBadgeSchema
} from "@shared/schema";
import { chatCompletion, chatCompletionJSON, hasAIServices, getActiveAIService } from "./ai";

// Helper to get file paths for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, "..", "uploads");

// Ensure uploads directory exists
async function ensureUploadDir() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create uploads directory:", error);
  }
}

// Helper to save uploaded file
async function saveFile(file: Buffer, originalName: string): Promise<string> {
  await ensureUploadDir();
  const hash = createHash("md5").update(originalName + Date.now()).digest("hex");
  const fileExtension = originalName.split(".").pop() || "pdf";
  const fileName = `${hash}.${fileExtension}`;
  const filePath = join(uploadDir, fileName);
  await fs.writeFile(filePath, file);
  return `/uploads/${fileName}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // API Routes
  // All routes should be prefixed with /api
  
  // Auth endpoints
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // User endpoints
  app.get("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      const badges = await storage.getUserBadges(userId);
      
      return res.status(200).json({ 
        ...userWithoutPassword, 
        badges 
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // Study material endpoints
  app.get("/api/materials/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const materials = await storage.getMaterialsByUserId(userId);
      return res.status(200).json(materials);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/materials/detail/:id", async (req: Request, res: Response) => {
    try {
      const materialId = parseInt(req.params.id);
      const material = await storage.getMaterial(materialId);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      return res.status(200).json(material);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/materials", async (req: Request, res: Response) => {
    try {
      // For file uploads, this would need to be handled with a multipart form parser
      // Simplified for this implementation
      if (!req.body.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { file, ...materialData } = req.body;
      
      // In a real implementation, you'd process the file buffer
      // This is a simplified version
      const filePath = await saveFile(Buffer.from(file, 'base64'), materialData.title);
      
      const parsedData = insertStudyMaterialSchema.parse({
        ...materialData,
        filePath,
        fileType: 'pdf',
      });
      
      const material = await storage.createMaterial(parsedData);
      return res.status(201).json(material);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/materials/:id", async (req: Request, res: Response) => {
    try {
      const materialId = parseInt(req.params.id);
      const material = await storage.getMaterial(materialId);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      const updatedMaterial = await storage.updateMaterial(materialId, req.body);
      return res.status(200).json(updatedMaterial);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/materials/:id", async (req: Request, res: Response) => {
    try {
      const materialId = parseInt(req.params.id);
      const material = await storage.getMaterial(materialId);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      await storage.deleteMaterial(materialId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // Study summaries endpoints
  app.post("/api/summaries", async (req: Request, res: Response) => {
    try {
      const summaryData = insertMaterialSummarySchema.parse(req.body);
      const material = await storage.getMaterial(summaryData.materialId);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      const summary = await storage.createMaterialSummary(summaryData);
      return res.status(201).json(summary);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/summaries/material/:materialId", async (req: Request, res: Response) => {
    try {
      const materialId = parseInt(req.params.materialId);
      const summaries = await storage.getMaterialSummariesByMaterialId(materialId);
      return res.status(200).json(summaries);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // Study session endpoints
  app.get("/api/sessions/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getStudySessionsByUserId(userId);
      return res.status(200).json(sessions);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/sessions/upcoming/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getUpcomingStudySessions(userId);
      return res.status(200).json(sessions);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/sessions", async (req: Request, res: Response) => {
    try {
      const sessionData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(sessionData);
      return res.status(201).json(session);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/sessions/:id", async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getStudySession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Study session not found" });
      }
      
      const updatedSession = await storage.updateStudySession(sessionId, req.body);
      return res.status(200).json(updatedSession);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/sessions/:id", async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getStudySession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Study session not found" });
      }
      
      await storage.deleteStudySession(sessionId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // Flashcard endpoints
  app.get("/api/flashcards/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const flashcards = await storage.getFlashcardsByUserId(userId);
      return res.status(200).json(flashcards);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/flashcards/material/:materialId", async (req: Request, res: Response) => {
    try {
      const materialId = parseInt(req.params.materialId);
      const flashcards = await storage.getFlashcardsByMaterialId(materialId);
      return res.status(200).json(flashcards);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/flashcards", async (req: Request, res: Response) => {
    try {
      const flashcardData = insertFlashcardSchema.parse(req.body);
      const flashcard = await storage.createFlashcard(flashcardData);
      return res.status(201).json(flashcard);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/flashcards/:id", async (req: Request, res: Response) => {
    try {
      const flashcardId = parseInt(req.params.id);
      const flashcard = await storage.getFlashcard(flashcardId);
      
      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }
      
      await storage.deleteFlashcard(flashcardId);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // Conversation endpoints
  app.get("/api/conversations/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations = await storage.getConversationsByUserId(userId);
      return res.status(200).json(conversations);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      return res.status(201).json(conversation);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const updatedConversation = await storage.updateConversation(conversationId, req.body.messages);
      return res.status(200).json(updatedConversation);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // AI endpoints
  // Get AI service status
  app.get("/api/ai/status", (_req: Request, res: Response) => {
    const hasAI = hasAIServices();
    const activeService = getActiveAIService();
    
    return res.status(200).json({
      available: hasAI,
      service: activeService
    });
  });

  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { userId, message, conversationId } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ message: "User ID and message are required" });
      }
      
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(parseInt(conversationId));
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
      }
      
      // Prepare messages for OpenAI
      const messages = conversation 
        ? [...conversation.messages, { role: "user", content: message }]
        : [
            { role: "system", content: "You are an AI study assistant helping students learn and understand complex topics. Provide clear, concise explanations and be supportive." },
            { role: "user", content: message }
          ];
      
      // Call AI service (OpenAI with Gemini fallback)
      const aiResponse = await chatCompletion(messages);
      
      // Update or create conversation
      const updatedMessages = [...messages, { role: "system", content: aiResponse }];
      
      if (conversation) {
        const updatedConversation = await storage.updateConversation(conversation.id, updatedMessages);
        return res.status(200).json({ 
          response: aiResponse,
          conversation: updatedConversation
        });
      } else {
        const newConversation = await storage.createConversation({
          userId: parseInt(userId),
          messages: updatedMessages
        });
        return res.status(200).json({ 
          response: aiResponse,
          conversation: newConversation
        });
      }
    } catch (error: any) {
      console.error("AI chat error:", error);
      return res.status(500).json({ message: "Failed to get AI response", error: error.message });
    }
  });

  app.post("/api/ai/summarize", async (req: Request, res: Response) => {
    try {
      const { userId, materialId, content } = req.body;
      
      if (!userId || !materialId || !content) {
        return res.status(400).json({ message: "User ID, material ID, and content are required" });
      }
      
      // Call AI service for summarization
      const messages = [
        { 
          role: "assistant", 
          content: "You are an AI academic assistant. Summarize the following text to create a comprehensive study note that captures the key points and important details. Format with appropriate headings, bullet points, and emphasis."
        },
        { role: "user", content: content }
      ];
      
      const summary = await chatCompletion(messages);
      
      // Save the summary
      const newSummary = await storage.createMaterialSummary({
        userId: parseInt(userId),
        materialId: parseInt(materialId),
        content: summary || ""
      });
      
      return res.status(200).json(newSummary);
    } catch (error: any) {
      console.error("AI summarization error:", error);
      return res.status(500).json({ message: "Failed to summarize content", error: error.message });
    }
  });

  app.post("/api/ai/flashcards", async (req: Request, res: Response) => {
    try {
      const { userId, materialId, topic, count = 5 } = req.body;
      
      if (!userId || !topic) {
        return res.status(400).json({ message: "User ID and topic are required" });
      }
      
      // Call AI service to generate flashcards
      const messages = [
        { 
          role: "user", 
          content: `Generate ${count} flashcards for studying the topic: ${topic}. Format the response as a JSON object with a 'flashcards' array of objects, each with 'question' and 'answer' fields.`
        }
      ];
      
      try {
        const flashcardsData = await chatCompletionJSON<{flashcards: Array<{question: string, answer: string}>}>(messages);
        
        // Validate and save flashcards
        if (Array.isArray(flashcardsData.flashcards)) {
          const savedFlashcards = await Promise.all(
            flashcardsData.flashcards.map(async (card: any) => {
              if (card.question && card.answer) {
                return await storage.createFlashcard({
                  userId: parseInt(userId),
                  materialId: materialId ? parseInt(materialId) : undefined,
                  question: card.question,
                  answer: card.answer
                });
              }
              return null;
            })
          );
          
          return res.status(200).json(savedFlashcards.filter(Boolean));
        } else {
          throw new Error("Invalid flashcards format");
        }
      } catch (parseError) {
        console.error("Failed to parse flashcards:", parseError);
        // Fallback handling if JSON parsing fails
        const flashcards = [];
        
        // Generate a basic summary as fallback
        const summary = await chatCompletion([
          { role: "user", content: `Provide a concise summary of key concepts about: ${topic}` }
        ]);
        
        // Create at least one flashcard from the summary
        const fallbackFlashcard = await storage.createFlashcard({
          userId: parseInt(userId),
          materialId: materialId ? parseInt(materialId) : undefined,
          question: `Key concepts about ${topic}?`,
          answer: summary || `Information about ${topic}`
        });
        
        flashcards.push(fallbackFlashcard);
        return res.status(200).json(flashcards);
      }
    } catch (error: any) {
      console.error("AI flashcards error:", error);
      return res.status(500).json({ message: "Failed to generate flashcards", error: error.message });
    }
  });

  // Study plan generation
  app.post("/api/ai/study-plan", async (req: Request, res: Response) => {
    try {
      const { userId, topics, durationDays, hoursPerDay } = req.body;
      
      if (!userId || !topics || !durationDays || !hoursPerDay) {
        return res.status(400).json({ 
          message: "User ID, topics, duration days, and hours per day are required" 
        });
      }
      
      // Call AI service to generate study plan
      const messages = [
        { 
          role: "user", 
          content: `Generate a detailed ${durationDays}-day study plan for the following topics: ${topics.join(", ")}. 
          The student can study ${hoursPerDay} hours per day. 
          Format the response as a JSON object with a 'sessions' array, each session having fields 'title', 'subject', 'startTime', 'endTime'. 
          Use ISO date strings for times, starting from tomorrow. Distribute the sessions appropriately across the specified duration.`
        }
      ];
      
      try {
        const planData = await chatCompletionJSON<{sessions: Array<{title: string, subject: string, startTime: string, endTime: string}>}>(messages);
        
        // Process and save study sessions
        if (Array.isArray(planData.sessions)) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          
          const savedSessions = await Promise.all(
            planData.sessions.map(async (session: any) => {
              if (session.title && session.subject && session.startTime && session.endTime) {
                return await storage.createStudySession({
                  userId: parseInt(userId),
                  title: session.title,
                  subject: session.subject,
                  startTime: new Date(session.startTime),
                  endTime: new Date(session.endTime)
                });
              }
              return null;
            })
          );
          
          return res.status(200).json(savedSessions.filter(Boolean));
        } else {
          throw new Error("Invalid study plan format");
        }
      } catch (parseError) {
        console.error("Failed to parse study plan:", parseError);
        return res.status(500).json({ message: "Failed to generate valid study plan" });
      }
    } catch (error: any) {
      console.error("AI study plan error:", error);
      return res.status(500).json({ message: "Failed to generate study plan", error: error.message });
    }
  });

  return httpServer;
}
