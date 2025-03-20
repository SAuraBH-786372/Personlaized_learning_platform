import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isTomorrow, isThisWeek, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface StudySession {
  id: number;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
}

interface SessionListProps {
  userId: number;
}

export default function SessionList({ userId }: SessionListProps) {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['/api/sessions', userId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${userId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch study sessions');
      return res.json();
    },
  });
  
  const handleCompleteSession = async (sessionId: number) => {
    try {
      await apiRequest("PUT", `/api/sessions/${sessionId}`, {
        isCompleted: true
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/upcoming', userId] });
      
      toast({
        title: "Session completed!",
        description: "Your study session has been marked as complete.",
      });
      
      setShowDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update session status.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteSession = async (sessionId: number) => {
    try {
      await apiRequest("DELETE", `/api/sessions/${sessionId}`, {});
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/upcoming', userId] });
      
      toast({
        title: "Session deleted",
        description: "Your study session has been deleted.",
      });
      
      setShowDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete session.",
        variant: "destructive",
      });
    }
  };
  
  // Group sessions by day
  const groupSessionsByDay = (sessions: StudySession[]) => {
    if (!sessions) return {};
    
    const grouped: Record<string, StudySession[]> = {};
    
    sessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    sessions.forEach(session => {
      const date = new Date(session.startTime);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(session);
    });
    
    return grouped;
  };
  
  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE'); // Day name
    
    return format(date, 'MMMM d, yyyy');
  };
  
  const getSessionStatusClass = (session: StudySession) => {
    if (session.isCompleted) return 'border-secondary';
    
    const now = new Date();
    const startTime = new Date(session.startTime);
    
    if (startTime < now) return 'border-warning';
    
    if (isToday(startTime)) return 'border-primary';
    
    return 'border-neutral-300';
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-neutral-100 animate-pulse rounded-lg"></div>
        <div className="h-16 bg-neutral-100 animate-pulse rounded-lg"></div>
        <div className="h-16 bg-neutral-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Failed to load study sessions.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/sessions', userId] })}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const groupedSessions = groupSessionsByDay(sessions || []);
  const nextWeek = addDays(new Date(), 7);
  const isEmptySessions = Object.keys(groupedSessions).length === 0;
  
  return (
    <div>
      {isEmptySessions ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <span className="material-icons text-neutral-400 text-2xl">event_busy</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No study sessions found</h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-6">
            You don't have any upcoming study sessions. Create a new study plan to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSessions).map(([dateKey, dateSessions]) => (
            <div key={dateKey}>
              <h3 className="text-lg font-medium mb-3">{getDayLabel(dateKey)}</h3>
              <div className="space-y-3">
                {dateSessions.map((session) => (
                  <div 
                    key={session.id}
                    className={`bg-neutral-50 p-4 rounded-lg border-l-4 ${getSessionStatusClass(session)} flex justify-between items-center`}
                  >
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{session.title}</p>
                        {session.isCompleted && (
                          <span className="ml-2 text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">{session.subject}</p>
                      <div className="flex items-center text-sm text-neutral-500 mt-1">
                        <span className="material-icons text-[16px] mr-1">schedule</span>
                        <span>
                          {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <Dialog open={showDialog && selectedSession?.id === session.id} onOpenChange={(open) => {
                      setShowDialog(open);
                      if (!open) setSelectedSession(null);
                    }}>
                      <DialogTrigger asChild>
                        <button 
                          className="text-neutral-400 hover:text-neutral-600"
                          onClick={() => setSelectedSession(session)}
                        >
                          <span className="material-icons">more_vert</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Session Options</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 mt-4">
                          {!session.isCompleted && (
                            <Button 
                              className="w-full justify-start"
                              onClick={() => handleCompleteSession(session.id)}
                            >
                              <span className="material-icons mr-2">check_circle</span>
                              Mark as Complete
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <span className="material-icons mr-2">delete</span>
                            Delete Session
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
