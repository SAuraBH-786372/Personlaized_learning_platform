import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateStudyPlan } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface PlannerFormProps {
  userId: number;
  onPlanCreated: () => void;
}

export default function PlannerForm({ userId, onPlanCreated }: PlannerFormProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm({
    defaultValues: {
      topics: "",
      durationDays: "7",
      hoursPerDay: "2",
    },
  });

  const onSubmit = async (data: any) => {
    setIsGenerating(true);
    
    try {
      const topics = data.topics.split(',').map((topic: string) => topic.trim());
      const durationDays = parseInt(data.durationDays);
      const hoursPerDay = parseInt(data.hoursPerDay);
      
      await generateStudyPlan(userId, topics, durationDays, hoursPerDay);
      
      toast({
        title: "Study plan created!",
        description: "Your personalized study plan has been generated.",
      });
      
      // Refresh sessions data
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/upcoming', userId] });
      
      // Redirect to plan view
      onPlanCreated();
    } catch (error) {
      toast({
        title: "Failed to create plan",
        description: "There was an error generating your study plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-neutral-50 mb-6">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="material-icons text-accent">tips_and_updates</span>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-2">AI Study Planner Tips</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
                <li>List multiple subjects or topics separated by commas</li>
                <li>Consider your existing commitments when choosing study hours</li>
                <li>Break complex topics into smaller, more manageable pieces</li>
                <li>The AI will distribute your study time optimally based on topic complexity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="topics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Study Topics</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter topics separated by commas (e.g., Calculus, Organic Chemistry, World History)" 
                    className="min-h-24"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="durationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Duration (Days)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hoursPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Per Day</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="3">3 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="5">5+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Generating Plan...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">auto_awesome</span>
                Generate AI Study Plan
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
