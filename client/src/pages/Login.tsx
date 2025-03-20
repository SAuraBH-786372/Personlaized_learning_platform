import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, navigate] = useLocation();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setLoading(true);
    try {
      await login(data.username, data.password);
      navigate("/");
    } catch (error: any) {
      console.error(error);
      // Error is handled in AuthContext
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        <div className="lg:order-2">
          <Card className="w-full shadow-lg border-muted">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to continue your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => navigate("/register")}
                >
                  Create one now
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
        
        <div className="hidden lg:flex flex-col lg:order-1">
          <h1 className="text-4xl font-bold tracking-tight">
            AI Study Assistant
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-md">
            Your smart study companion that helps you learn more effectively with personalized study plans, 
            AI-powered summarization, and interactive study sessions.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border">
              <div className="font-medium mb-2">Smart Planning</div>
              <p className="text-sm text-muted-foreground">
                Create optimized study schedules based on your goals and available time
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="font-medium mb-2">AI Tutoring</div>
              <p className="text-sm text-muted-foreground">
                Get instant help with complex topics from your AI study buddy
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="font-medium mb-2">Text Summarization</div>
              <p className="text-sm text-muted-foreground">
                Quickly comprehend textbooks with intelligent summaries
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="font-medium mb-2">Progress Tracking</div>
              <p className="text-sm text-muted-foreground">
                Monitor your learning journey with detailed analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}