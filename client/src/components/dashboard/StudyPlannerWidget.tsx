import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface StudySession {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
}

interface StudyPlannerWidgetProps {
  userId: number;
  onAddSession: () => void;
}

export default function StudyPlannerWidget({ userId, onAddSession }: StudyPlannerWidgetProps) {
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['/api/sessions/upcoming', userId],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/upcoming/${userId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch study sessions');
      return res.json();
    },
  });

  // Group sessions by day
  const todaySessions = sessions?.filter((session: StudySession) => {
    const sessionDate = new Date(session.startTime).toDateString();
    const today = new Date().toDateString();
    return sessionDate === today;
  }) || [];

  const tomorrowSessions = sessions?.filter((session: StudySession) => {
    const sessionDate = new Date(session.startTime).toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return sessionDate === tomorrow.toDateString();
  }) || [];

  const handleCompleteSession = async (sessionId: number) => {
    try {
      await apiRequest("PUT", `/api/sessions/${sessionId}`, {
        isCompleted: true
      });
      
      toast({
        title: "Session completed!",
        description: "Your study session has been marked as complete.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update session status.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load study sessions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row items-center justify-between">
        <CardTitle className="font-display font-semibold text-lg">Upcoming Study Sessions</CardTitle>
        <div className="flex space-x-2">
          <button className="text-neutral-400 hover:text-neutral-600 p-1">
            <span className="material-icons">today</span>
          </button>
          <button 
            className="text-neutral-400 hover:text-neutral-600 p-1"
            onClick={onAddSession}
          >
            <span className="material-icons">add</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-16 bg-neutral-100 animate-pulse rounded-lg"></div>
            <div className="h-16 bg-neutral-100 animate-pulse rounded-lg"></div>
          </div>
        ) : (
          <>
            {/* Today's sessions */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-neutral-600 mb-3">Today</h3>
              {todaySessions.length > 0 ? (
                todaySessions.map((session: StudySession) => (
                  <div 
                    key={session.id}
                    className="bg-neutral-50 p-3 rounded-lg mb-2 border-l-4 border-primary flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <div className="flex items-center text-sm text-neutral-500 mt-1">
                        <span className="material-icons text-[16px] mr-1">schedule</span>
                        <span>
                          {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <Dialog>
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
                          <Button 
                            className="w-full justify-start"
                            onClick={() => handleCompleteSession(selectedSession?.id || 0)}
                          >
                            <span className="material-icons mr-2">check_circle</span>
                            Mark as Complete
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                          >
                            <span className="material-icons mr-2">edit</span>
                            Edit Session
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-sm">No sessions scheduled for today.</p>
              )}
            </div>
            
            {/* Tomorrow's sessions */}
            <div>
              <h3 className="text-sm font-medium text-neutral-600 mb-3">Tomorrow</h3>
              {tomorrowSessions.length > 0 ? (
                tomorrowSessions.map((session: StudySession) => (
                  <div 
                    key={session.id}
                    className="bg-neutral-50 p-3 rounded-lg mb-2 border-l-4 border-neutral-300 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <div className="flex items-center text-sm text-neutral-500 mt-1">
                        <span className="material-icons text-[16px] mr-1">schedule</span>
                        <span>
                          {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    <button className="text-neutral-400 hover:text-neutral-600">
                      <span className="material-icons">more_vert</span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-sm">No sessions scheduled for tomorrow.</p>
              )}
              
              <Button
                variant="ghost"
                className="w-full mt-4 text-primary font-medium flex items-center justify-center py-2 hover:bg-primary/5 rounded-lg transition"
                onClick={onAddSession}
              >
                <span className="material-icons mr-1">add</span>
                <span>Add Study Session</span>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
