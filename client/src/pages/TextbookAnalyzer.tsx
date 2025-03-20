import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PdfViewer from "@/components/textbook/PdfViewer";
import Summary from "@/components/textbook/Summary";
import PDFUploaderWidget from "@/components/dashboard/PDFUploaderWidget";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function TextbookAnalyzer() {
  const [location, navigate] = useLocation();
  const search = location.split('?')[1] || '';
  const params = new URLSearchParams(search);
  const materialId = params.get("id") ? parseInt(params.get("id")!) : null;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("view");
  
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

  // Get current material details
  const { data: currentMaterial, isLoading: isLoadingMaterial } = useQuery({
    queryKey: ['/api/materials/detail', materialId],
    queryFn: async () => {
      if (!materialId) return null;
      const res = await fetch(`/api/materials/detail/${materialId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch material details');
      return res.json();
    },
    enabled: !!materialId,
  });

  // Get material summaries
  const { data: summaries, isLoading: isLoadingSummaries } = useQuery({
    queryKey: ['/api/summaries/material', materialId],
    queryFn: async () => {
      if (!materialId) return [];
      const res = await fetch(`/api/summaries/material/${materialId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch summaries');
      return res.json();
    },
    enabled: !!materialId,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      if (!materialId) return null;
      const response = await apiRequest("PUT", `/api/materials/${materialId}`, {
        progress,
        lastViewed: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress updated",
        description: "Your progress has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update progress.",
        variant: "destructive",
      });
    }
  });

  const handleUpdateProgress = (progress: number) => {
    updateProgressMutation.mutate(progress);
  };

  const handleGenerateFlashcards = () => {
    if (!currentMaterial) return;
    navigate(`/study-buddy?tab=flashcards&topic=${currentMaterial.title}&materialId=${materialId}`);
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
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white mb-8">
            <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">
              Textbook Analyzer
            </h1>
            <p className="text-white/80 max-w-xl">
              Upload and analyze your study materials. Our AI will help extract key concepts, create summaries, and generate study materials.
            </p>
          </div>
          
          {!materialId ? (
            <PDFUploaderWidget userId={mockUser.id} />
          ) : (
            <Card>
              <CardHeader className="px-6 py-4 border-b border-neutral-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-display font-semibold text-lg">
                    {isLoadingMaterial ? "Loading..." : currentMaterial?.title || "Study Material"}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleGenerateFlashcards}
                    >
                      <span className="material-icons text-[18px] mr-1">forum</span>
                      Create Flashcards
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full rounded-none border-b">
                    <TabsTrigger value="view" className="flex-1">View Document</TabsTrigger>
                    <TabsTrigger value="summary" className="flex-1">AI Summary</TabsTrigger>
                  </TabsList>
                  <TabsContent value="view" className="p-0 m-0">
                    <PdfViewer 
                      material={currentMaterial}
                      onProgressUpdate={handleUpdateProgress}
                    />
                  </TabsContent>
                  <TabsContent value="summary" className="p-6 m-0">
                    <Summary 
                      materialId={materialId}
                      userId={mockUser.id}
                      summaries={summaries || []}
                      isLoading={isLoadingSummaries}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
