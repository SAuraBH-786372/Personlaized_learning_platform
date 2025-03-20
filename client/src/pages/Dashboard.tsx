import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/Sidebar";
import Banner from "@/components/dashboard/Banner";
import StudyPlannerWidget from "@/components/dashboard/StudyPlannerWidget";
import RecentMaterialsWidget from "@/components/dashboard/RecentMaterialsWidget";
import AIStudyBuddyWidget from "@/components/dashboard/AIStudyBuddyWidget";
import ProgressTrackerWidget from "@/components/dashboard/ProgressTrackerWidget";
import FlashcardWidget from "@/components/dashboard/FlashcardWidget";
import PDFUploaderWidget from "@/components/dashboard/PDFUploaderWidget";

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

export default function Dashboard() {
  const [_, navigate] = useLocation();

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

  // Subjects progress data
  const subjectsProgress = [
    { subject: "Psychology", hours: 5.5, percentage: 44, color: "bg-secondary" },
    { subject: "Computer Science", hours: 4.0, percentage: 32, color: "bg-primary" },
    { subject: "Organic Chemistry", hours: 3.0, percentage: 24, color: "bg-accent" }
  ];

  // Suggested focus
  const suggestedFocus = {
    subject: "Organic Chemistry", 
    topic: "Reaction Mechanisms",
    reason: "Based on your recent quiz results, focusing more on reaction mechanisms could improve your understanding."
  };

  const handleNewSession = () => {
    navigate("/study-planner");
  };

  const handleAskStudyBuddy = () => {
    navigate("/study-buddy");
  };

  const handleMaterialSelect = (id: number) => {
    navigate(`/textbook-analyzer?id=${id}`);
  };

  const handleGenerateMoreFlashcards = () => {
    navigate("/study-buddy?tab=flashcards");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        user={mockUser} 
        recentMaterials={recentMaterials}
        userBadges={badges || []}
      />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Banner 
            user={mockUser} 
            weeklyProgress={75} 
            onNewSession={handleNewSession}
            onAskStudyBuddy={handleAskStudyBuddy}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <StudyPlannerWidget 
                userId={mockUser.id} 
                onAddSession={handleNewSession} 
              />
              
              <RecentMaterialsWidget 
                userId={mockUser.id}
                onMaterialSelect={handleMaterialSelect}
              />
            </div>
            
            <div className="space-y-6">
              <AIStudyBuddyWidget 
                userId={mockUser.id}
                onFullChat={() => navigate("/study-buddy")}
              />
              
              <ProgressTrackerWidget 
                totalHours={12.5}
                completion={63}
                subjects={subjectsProgress}
                suggestedFocus={suggestedFocus}
              />
              
              <FlashcardWidget 
                userId={mockUser.id}
                onGenerateMore={handleGenerateMoreFlashcards}
              />
            </div>
          </div>

          <PDFUploaderWidget userId={mockUser.id} />
        </div>
      </main>
    </div>
  );
}
