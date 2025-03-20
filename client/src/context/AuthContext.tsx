import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  level: number;
  xp: number;
} | null;

interface AuthContextType {
  user: User;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          setUser(userObj);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error parsing stored user", error);
          localStorage.removeItem("user");
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      const data = await response.json();
      
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(data.user));
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Invalid username or password";
        
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const checkAuth = async (): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    try {
      // Optional: Make a request to verify the session is still valid
      // This could be a lightweight endpoint that checks the session
      const response = await apiRequest("GET", `/api/user/${user.id}`, null);
      
      if (!response.ok) {
        throw new Error("Session expired");
      }
      
      return true;
    } catch (error: unknown) {
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      checkAuth,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}