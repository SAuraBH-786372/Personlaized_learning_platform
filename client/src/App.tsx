import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import StudyPlanner from "@/pages/StudyPlanner";
import TextbookAnalyzer from "@/pages/TextbookAnalyzer";
import StudyBuddy from "@/pages/StudyBuddy";
import ProgressTracker from "@/pages/ProgressTracker";

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/study-planner" component={StudyPlanner} />
      <Route path="/textbook-analyzer" component={TextbookAnalyzer} />
      <Route path="/study-buddy" component={StudyBuddy} />
      <Route path="/progress-tracker" component={ProgressTracker} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
