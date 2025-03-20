import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlannerForm from "@/components/study-planner/PlannerForm";
import SessionList from "@/components/study-planner/SessionList";
import { useQuery } from "@tanstack/react-query";

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

export default function StudyPlanner() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"upcoming" | "create">("upcoming");

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
              AI Study Planner
            </h1>
            <p className="text-white/80 max-w-xl">
              Create a personalized study schedule based on your goals and availability. Our AI will help optimize your learning time.
            </p>
          </div>
          
          <Card className="mb-8">
            <CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row items-center">
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 font-medium rounded-md ${activeTab === "upcoming" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                  onClick={() => setActiveTab("upcoming")}
                >
                  Upcoming Sessions
                </button>
                <button
                  className={`px-4 py-2 font-medium rounded-md ${activeTab === "create" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                  onClick={() => setActiveTab("create")}
                >
                  Create New Plan
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {activeTab === "upcoming" ? (
                <SessionList userId={mockUser.id} />
              ) : (
                <PlannerForm userId={mockUser.id} onPlanCreated={() => setActiveTab("upcoming")} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
