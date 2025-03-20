import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "@/components/study-buddy/ChatInterface";
import FlashcardGenerator from "@/components/study-buddy/FlashcardGenerator";

// Mock user for development
const mockUser = {
  id: 1,
  name: "Alex Johnson",
  email: "alex@example.com",
  level: 5,
  xp: 2500,
  firstName: "Alex",
  totalStudyTime: 750
};

export default function StudyBuddy() {
  const [location, navigate] = useLocation();
  const search = location.split('?')[1] || '';
  const params = new URLSearchParams(search);
  const initialTab = params.get("tab") || "chat";
  const topic = params.get("topic") || "";
  const materialId = params.get("materialId") ? parseInt(params.get("materialId") || "0") : undefined;
  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    // Update URL when tab changes
    navigate(`/study-buddy?tab=${activeTab}${topic ? `&topic=${topic}` : ''}${materialId ? `&materialId=${materialId}` : ''}`, {
      replace: true
    });
  }, [activeTab, navigate, topic, materialId]);

  // Get user badges
  const { data: badges } = useQuery({
    queryKey: ['/api/user', mockUser.id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/user/${mockUser.id}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        const userData = await res.json();
        return userData.badges || [];
      } catch (error) {
        return [];
      }
    },
  });

  // Get recent materials
  const { data: materials } = useQuery({
    queryKey: ['/api/materials', mockUser.id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/materials/${mockUser.id}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch materials');
        return res.json();
      } catch (error) {
        return [];
      }
    },
  });

  const recentMaterials = materials?.slice(0, 3).map((material: any) => ({
    id: material.id,
    title: material.title
  })) || [];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        user={mockUser} 
        recentMaterials={recentMaterials}
        userBadges={badges || []}
      />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white mb-8">
            <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">
              AI Study Buddy
            </h1>
            <p className="text-white/80 max-w-xl">
              Your personal AI assistant for learning. Ask questions, get explanations, create flashcards, and take quizzes on any topic.
            </p>
          </div>
          
          <Card>
            <CardHeader className="px-6 py-4 border-b border-neutral-200">
              <Tabs defaultValue={initialTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="chat">
                    <span className="material-icons text-sm mr-1">chat</span>
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="flashcards">
                    <span className="material-icons text-sm mr-1">style</span>
                    Flashcards
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent value="chat" className="m-0">
                <ChatInterface userId={mockUser.id} />
              </TabsContent>
              <TabsContent value="flashcards" className="m-0">
                <FlashcardGenerator 
                  userId={mockUser.id} 
                  initialTopic={topic} 
                  materialId={materialId}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}