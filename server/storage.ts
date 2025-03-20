import { 
  users, type User, type InsertUser,
  studyMaterials, type StudyMaterial, type InsertStudyMaterial,
  studySessions, type StudySession, type InsertStudySession,
  materialSummaries, type MaterialSummary, type InsertMaterialSummary,
  flashcards, type Flashcard, type InsertFlashcard,
  conversations, type Conversation, type InsertConversation,
  badges, type Badge,
  userBadges, type UserBadge, type InsertUserBadge
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Study materials operations
  getMaterial(id: number): Promise<StudyMaterial | undefined>;
  getMaterialsByUserId(userId: number): Promise<StudyMaterial[]>;
  createMaterial(material: InsertStudyMaterial): Promise<StudyMaterial>;
  updateMaterial(id: number, material: Partial<StudyMaterial>): Promise<StudyMaterial | undefined>;
  deleteMaterial(id: number): Promise<boolean>;

  // Study sessions operations
  getStudySession(id: number): Promise<StudySession | undefined>;
  getStudySessionsByUserId(userId: number): Promise<StudySession[]>;
  getUpcomingStudySessions(userId: number): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: number, session: Partial<StudySession>): Promise<StudySession | undefined>;
  deleteStudySession(id: number): Promise<boolean>;

  // Material summaries operations
  getMaterialSummary(id: number): Promise<MaterialSummary | undefined>;
  getMaterialSummariesByMaterialId(materialId: number): Promise<MaterialSummary[]>;
  createMaterialSummary(summary: InsertMaterialSummary): Promise<MaterialSummary>;

  // Flashcard operations
  getFlashcard(id: number): Promise<Flashcard | undefined>;
  getFlashcardsByUserId(userId: number): Promise<Flashcard[]>;
  getFlashcardsByMaterialId(materialId: number): Promise<Flashcard[]>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  deleteFlashcard(id: number): Promise<boolean>;

  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, messages: Array<{role: string, content: string}>): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<boolean>;

  // Badge operations
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<Badge[]>;
  assignBadgeToUser(userBadge: InsertUserBadge): Promise<UserBadge>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private studyMaterials: Map<number, StudyMaterial>;
  private studySessions: Map<number, StudySession>;
  private materialSummaries: Map<number, MaterialSummary>;
  private flashcards: Map<number, Flashcard>;
  private conversations: Map<number, Conversation>;
  private badges: Map<number, Badge>;
  private userBadges: Map<number, UserBadge>;
  
  private userId: number;
  private materialId: number;
  private sessionId: number;
  private summaryId: number;
  private flashcardId: number;
  private conversationId: number;
  private badgeId: number;
  private userBadgeId: number;

  constructor() {
    this.users = new Map();
    this.studyMaterials = new Map();
    this.studySessions = new Map();
    this.materialSummaries = new Map();
    this.flashcards = new Map();
    this.conversations = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    
    this.userId = 1;
    this.materialId = 1;
    this.sessionId = 1;
    this.summaryId = 1;
    this.flashcardId = 1;
    this.conversationId = 1;
    this.badgeId = 1;
    this.userBadgeId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  // Initialize some sample data
  private initializeSampleData() {
    // Create sample user
    const user: User = {
      id: this.userId++,
      username: 'alex',
      password: 'password123',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      level: 5,
      xp: 2500,
      totalStudyTime: 750,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);

    // Create sample badges
    const badges: Badge[] = [
      {
        id: this.badgeId++,
        name: 'Quick Learner',
        description: 'Completed 10 study sessions',
        icon: 'bolt',
        requirement: '10 study sessions'
      },
      {
        id: this.badgeId++,
        name: 'Consistent',
        description: 'Studied for 7 days in a row',
        icon: 'calendar_today',
        requirement: '7 day streak'
      },
      {
        id: this.badgeId++,
        name: 'Note Master',
        description: 'Created 50 flashcards',
        icon: 'edit_note',
        requirement: '50 flashcards'
      }
    ];
    badges.forEach(badge => this.badges.set(badge.id, badge));

    // Assign badges to user
    badges.forEach(badge => {
      const userBadge: UserBadge = {
        id: this.userBadgeId++,
        userId: user.id,
        badgeId: badge.id,
        earnedAt: new Date()
      };
      this.userBadges.set(userBadge.id, userBadge);
    });

    // Create sample materials
    const materials: StudyMaterial[] = [
      {
        id: this.materialId++,
        userId: user.id,
        title: 'Introduction to Psychology.pdf',
        description: 'Comprehensive introduction to psychology concepts',
        fileType: 'pdf',
        filePath: '/uploads/psychology_intro.pdf',
        progress: 75,
        lastViewed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        id: this.materialId++,
        userId: user.id,
        title: 'Data Structures & Algorithms.pdf',
        description: 'Computer science fundamentals',
        fileType: 'pdf',
        filePath: '/uploads/dsa.pdf',
        progress: 40,
        lastViewed: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      },
      {
        id: this.materialId++,
        userId: user.id,
        title: 'Organic Chemistry Notes.pdf',
        description: 'Collection of organic chemistry notes',
        fileType: 'pdf',
        filePath: '/uploads/organic_chem.pdf',
        progress: 25,
        lastViewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) // 21 days ago
      }
    ];
    materials.forEach(material => this.studyMaterials.set(material.id, material));

    // Create sample study sessions
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions: StudySession[] = [
      {
        id: this.sessionId++,
        userId: user.id,
        title: 'Data Structures & Algorithms',
        subject: 'Computer Science',
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM today
        endTime: new Date(today.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 AM today
        isCompleted: false,
        createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000) // yesterday
      },
      {
        id: this.sessionId++,
        userId: user.id,
        title: 'Psychology Exam Prep',
        subject: 'Psychology',
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM today
        endTime: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4 PM today
        isCompleted: false,
        createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000) // yesterday
      },
      {
        id: this.sessionId++,
        userId: user.id,
        title: 'Organic Chemistry Review',
        subject: 'Chemistry',
        startTime: new Date(tomorrow.getTime() + 9.5 * 60 * 60 * 1000), // 9:30 AM tomorrow
        endTime: new Date(tomorrow.getTime() + 11 * 60 * 60 * 1000), // 11 AM tomorrow
        isCompleted: false,
        createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000) // yesterday
      }
    ];
    sessions.forEach(session => this.studySessions.set(session.id, session));

    // Create sample flashcards
    const flashcards: Flashcard[] = [
      {
        id: this.flashcardId++,
        userId: user.id,
        materialId: 1, // Psychology
        question: 'What are the key components of a neural network?',
        answer: 'A neural network consists of: neurons (nodes), connections (weights), activation functions, and input, hidden, and output layers.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];
    flashcards.forEach(flashcard => this.flashcards.set(flashcard.id, flashcard));

    // Create sample conversation
    const conversation: Conversation = {
      id: this.conversationId++,
      userId: user.id,
      messages: [
        { role: 'system', content: "Hi Alex! I'm your AI Study Buddy. How can I help with your studies today?" },
        { role: 'user', content: 'Can you explain the concept of neural networks in simple terms?' },
        { role: 'system', content: "Think of neural networks like a team of friends solving a puzzle:\n1. Each friend (neuron) specializes in spotting certain patterns\n2. They pass information to each other through connections\n3. When they make mistakes, they learn and adjust\n4. With practice, the team gets better at solving similar puzzles\n\nJust like your brain learns by strengthening connections between neurons, artificial neural networks learn by adjusting the strength of connections between digital neurons.\n\nWould you like me to explain any specific part in more detail?" }
      ],
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    };
    this.conversations.set(conversation.id, conversation);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, level: 1, xp: 0, totalStudyTime: 0, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Study materials operations
  async getMaterial(id: number): Promise<StudyMaterial | undefined> {
    return this.studyMaterials.get(id);
  }

  async getMaterialsByUserId(userId: number): Promise<StudyMaterial[]> {
    return Array.from(this.studyMaterials.values())
      .filter(material => material.userId === userId)
      .sort((a, b) => (b.lastViewed?.getTime() || 0) - (a.lastViewed?.getTime() || 0));
  }

  async createMaterial(material: InsertStudyMaterial): Promise<StudyMaterial> {
    const id = this.materialId++;
    const newMaterial: StudyMaterial = { 
      ...material, 
      id, 
      progress: material.progress || 0,
      description: material.description || null,
      lastViewed: material.lastViewed || null,
      createdAt: new Date() 
    };
    this.studyMaterials.set(id, newMaterial);
    return newMaterial;
  }

  async updateMaterial(id: number, materialData: Partial<StudyMaterial>): Promise<StudyMaterial | undefined> {
    const material = this.studyMaterials.get(id);
    if (!material) return undefined;
    
    const updatedMaterial = { ...material, ...materialData };
    this.studyMaterials.set(id, updatedMaterial);
    return updatedMaterial;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    return this.studyMaterials.delete(id);
  }

  // Study sessions operations
  async getStudySession(id: number): Promise<StudySession | undefined> {
    return this.studySessions.get(id);
  }

  async getStudySessionsByUserId(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getUpcomingStudySessions(userId: number): Promise<StudySession[]> {
    const now = new Date();
    return Array.from(this.studySessions.values())
      .filter(session => session.userId === userId && session.startTime >= now && !session.isCompleted)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const id = this.sessionId++;
    const newSession: StudySession = { 
      ...session, 
      id, 
      isCompleted: false,
      createdAt: new Date() 
    };
    this.studySessions.set(id, newSession);
    return newSession;
  }

  async updateStudySession(id: number, sessionData: Partial<StudySession>): Promise<StudySession | undefined> {
    const session = this.studySessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionData };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteStudySession(id: number): Promise<boolean> {
    return this.studySessions.delete(id);
  }

  // Material summaries operations
  async getMaterialSummary(id: number): Promise<MaterialSummary | undefined> {
    return this.materialSummaries.get(id);
  }

  async getMaterialSummariesByMaterialId(materialId: number): Promise<MaterialSummary[]> {
    return Array.from(this.materialSummaries.values())
      .filter(summary => summary.materialId === materialId);
  }

  async createMaterialSummary(summary: InsertMaterialSummary): Promise<MaterialSummary> {
    const id = this.summaryId++;
    const newSummary: MaterialSummary = { 
      ...summary, 
      id, 
      createdAt: new Date() 
    };
    this.materialSummaries.set(id, newSummary);
    return newSummary;
  }

  // Flashcard operations
  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    return this.flashcards.get(id);
  }

  async getFlashcardsByUserId(userId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values())
      .filter(flashcard => flashcard.userId === userId);
  }

  async getFlashcardsByMaterialId(materialId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values())
      .filter(flashcard => flashcard.materialId === materialId);
  }

  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.flashcardId++;
    const newFlashcard: Flashcard = { 
      ...flashcard, 
      id, 
      materialId: flashcard.materialId || null,
      createdAt: new Date() 
    };
    this.flashcards.set(id, newFlashcard);
    return newFlashcard;
  }

  async deleteFlashcard(id: number): Promise<boolean> {
    return this.flashcards.delete(id);
  }

  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conversation => conversation.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationId++;
    const newConversation: Conversation = { 
      userId: conversation.userId,
      messages: Array.isArray(conversation.messages) ? [...conversation.messages] : [],
      id, 
      createdAt: new Date() 
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(id: number, messages: Array<{role: string, content: string}>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation = { ...conversation, messages };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  async deleteConversation(id: number): Promise<boolean> {
    return this.conversations.delete(id);
  }

  // Badge operations
  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getUserBadges(userId: number): Promise<Badge[]> {
    const userBadgeIds = Array.from(this.userBadges.values())
      .filter(userBadge => userBadge.userId === userId)
      .map(userBadge => userBadge.badgeId);
    
    return Array.from(this.badges.values())
      .filter(badge => userBadgeIds.includes(badge.id));
  }

  async assignBadgeToUser(userBadge: InsertUserBadge): Promise<UserBadge> {
    const id = this.userBadgeId++;
    const newUserBadge: UserBadge = {
      ...userBadge,
      id,
      earnedAt: new Date()
    };
    this.userBadges.set(id, newUserBadge);
    return newUserBadge;
  }
}

export const storage = new MemStorage();
