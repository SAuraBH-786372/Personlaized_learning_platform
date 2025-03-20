import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { isAuthenticated, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Logging you in...",
      });
      
      // Log the user in after successful registration
      await login(data.username, data.password);
      navigate("/");
      
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
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
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Join our learning platform and start your educational journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
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
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-6" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => navigate("/login")}
                >
                  Sign in
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
          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-2">Why join our platform?</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 h-5 w-5 text-primary flex items-center justify-center rounded-full bg-primary/10">✓</div>
                  <span>AI-powered study buddy available 24/7</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 h-5 w-5 text-primary flex items-center justify-center rounded-full bg-primary/10">✓</div>
                  <span>Personalized study plans based on your learning style</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 h-5 w-5 text-primary flex items-center justify-center rounded-full bg-primary/10">✓</div>
                  <span>Intelligent textbook analyzer for quick comprehension</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 h-5 w-5 text-primary flex items-center justify-center rounded-full bg-primary/10">✓</div>
                  <span>Track your progress with detailed analytics</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5 h-5 w-5 text-primary flex items-center justify-center rounded-full bg-primary/10">✓</div>
                  <span>Earn badges and rewards as you learn</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}