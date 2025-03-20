import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';

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

// Mock data for the chart
const weeklyData = [
  { day: 'Mon', hours: 1.5 },
  { day: 'Tue', hours: 2.0 },
  { day: 'Wed', hours: 0.5 },
  { day: 'Thu', hours: 3.0 },
  { day: 'Fri', hours: 2.5 },
  { day: 'Sat', hours: 1.0 },
  { day: 'Sun', hours: 2.0 },
];

// Mock subjects data
const subjectsData = [
  { 
    name: "Psychology", 
    progress: 75, 
    topics: [
      { name: "Cognitive Psychology", mastery: 85 },
      { name: "Developmental Psychology", mastery: 70 },
      { name: "Social Psychology", mastery: 65 }
    ]
  },
  { 
    name: "Computer Science", 
    progress: 60, 
    topics: [
      { name: "Data Structures", mastery: 80 },
      { name: "Algorithms", mastery: 75 },
      { name: "Object-Oriented Programming", mastery: 55 }
    ]
  },
  { 
    name: "Organic Chemistry", 
    progress: 45, 
    topics: [
      { name: "Functional Groups", mastery: 60 },
      { name: "Reaction Mechanisms", mastery: 35 },
      { name: "Stereochemistry", mastery: 50 }
    ]
  }
];

export default function ProgressTracker() {
  const [_, navigate] = useLocation();
  const [timeframe, setTimeframe] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");
  
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
              Progress Tracker
            </h1>
            <p className="text-white/80 max-w-xl">
              Track your study progress, identify strengths and weaknesses, and get personalized suggestions to improve your learning.
            </p>
          </div>
          
          <Card className="mb-8">
            <CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row items-center justify-between">
              <CardTitle className="font-display font-semibold text-lg">Study Overview</CardTitle>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:space-x-8">
                <div className="md:w-1/3 mb-6 md:mb-0">
                  <div className="text-center mb-4">
                    <p className="text-sm font-medium text-neutral-500">Total Study Time</p>
                    <p className="text-3xl font-bold">{mockUser.totalStudyTime / 60} hrs</p>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Level {mockUser.level}</span>
                      <span className="text-xs text-neutral-500">{mockUser.xp} XP</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2 mb-1">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ width: `${(mockUser.xp % 1000) / 10}%` }} 
                      />
                    </div>
                    <p className="text-xs text-neutral-500">
                      {1000 - (mockUser.xp % 1000)} XP to next level
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Earned Badges</p>
                    <div className="flex flex-wrap gap-2">
                      {badges?.map((badge: any) => (
                        <div 
                          key={badge.id}
                          className="flex items-center bg-neutral-100 rounded-full px-3 py-1"
                          title={badge.description}
                        >
                          <span className="material-icons text-accent text-sm mr-1">{badge.icon}</span>
                          <span className="text-xs font-medium">{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <p className="text-sm font-medium mb-2">Daily Study Hours</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" fill="hsl(var(--primary))" name="Hours" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="px-6 py-4 border-b border-neutral-200">
              <CardTitle className="font-display font-semibold text-lg">Subject Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Subject Overview</TabsTrigger>
                  <TabsTrigger value="details">Topic Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="m-0 p-0">
                  <div className="space-y-6">
                    {subjectsData.map((subject, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{subject.name}</h3>
                          <span className="text-sm text-neutral-500">{subject.progress}% mastery</span>
                        </div>
                        <Progress value={subject.progress} className="h-2 mb-4" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {subject.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="bg-neutral-50 p-3 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-medium">{topic.name}</p>
                                <span className="text-xs">{topic.mastery}%</span>
                              </div>
                              <Progress value={topic.mastery} className="h-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="m-0 p-0">
                  <div className="space-y-6">
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
                      <div className="flex">
                        <span className="material-icons text-warning mr-2">tips_and_updates</span>
                        <div>
                          <p className="font-medium">Suggested Focus Areas</p>
                          <p className="text-sm text-neutral-600 mt-1">
                            Based on your progress, we recommend focusing on these topics:
                          </p>
                          <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                            <li>Organic Chemistry: Reaction Mechanisms (35% mastery)</li>
                            <li>Computer Science: Object-Oriented Programming (55% mastery)</li>
                            <li>Social Psychology: Group Dynamics (60% mastery)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-4">Learning Achievements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center mr-2">
                              <span className="material-icons text-accent">schedule</span>
                            </div>
                            <p className="font-medium">Most Consistent Subject</p>
                          </div>
                          <p className="text-sm text-neutral-600">
                            You've studied <span className="font-medium">Psychology</span> most consistently, with an average of 4 sessions per week.
                          </p>
                        </div>
                        
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                              <span className="material-icons text-primary">trending_up</span>
                            </div>
                            <p className="font-medium">Most Improved Topic</p>
                          </div>
                          <p className="text-sm text-neutral-600">
                            <span className="font-medium">Data Structures</span> has shown the most improvement, with a 25% increase in mastery this month.
                          </p>
                        </div>
                        
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center mr-2">
                              <span className="material-icons text-secondary">emoji_events</span>
                            </div>
                            <p className="font-medium">Longest Study Streak</p>
                          </div>
                          <p className="text-sm text-neutral-600">
                            You maintained a 12-day study streak from June 3rd to June 14th.
                          </p>
                        </div>
                        
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center mr-2">
                              <span className="material-icons text-warning">lightbulb</span>
                            </div>
                            <p className="font-medium">Learning Style Insight</p>
                          </div>
                          <p className="text-sm text-neutral-600">
                            You learn best through visual materials and interactive quizzes based on your engagement patterns.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
