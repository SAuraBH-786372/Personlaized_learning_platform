import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import StudyPlanner from "@/pages/StudyPlanner";
import TextbookAnalyzer from "@/pages/TextbookAnalyzer";
import StudyBuddy from "@/pages/StudyBuddy";
import ProgressTracker from "@/pages/ProgressTracker";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/study-planner">
        <ProtectedRoute>
          <StudyPlanner />
        </ProtectedRoute>
      </Route>
      <Route path="/textbook-analyzer">
        <ProtectedRoute>
          <TextbookAnalyzer />
        </ProtectedRoute>
      </Route>
      <Route path="/study-buddy">
        <ProtectedRoute>
          <StudyBuddy />
        </ProtectedRoute>
      </Route>
      <Route path="/progress-tracker">
        <ProtectedRoute>
          <ProgressTracker />
        </ProtectedRoute>
      </Route>
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
