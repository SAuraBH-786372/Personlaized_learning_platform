import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateFlashcards } from "@/lib/openai";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface FlashcardGeneratorProps {
  userId: number;
  initialTopic?: string;
  materialId?: number;
}

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  materialId?: number;
}

export default function FlashcardGenerator({ userId, initialTopic = "", materialId }: FlashcardGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [displayedFlashcards, setDisplayedFlashcards] = useState<Flashcard[]>([]);
  
  const form = useForm({
    defaultValues: {
      topic: initialTopic,
      count: "5",
      materialId: materialId?.toString() || ""
    },
  });
  
  // Get user materials for select dropdown
  const { data: materials } = useQuery({
    queryKey: ['/api/materials', userId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/materials/${userId}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch materials');
        return res.json();
      } catch (error) {
        return [];
      }
    },
  });
  
  // Get existing flashcards
  const { data: flashcards, isLoading: isLoadingFlashcards } = useQuery({
    queryKey: ['/api/flashcards', userId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/flashcards/${userId}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch flashcards');
        return res.json();
      } catch (error) {
        return [];
      }
    },
  });
  
  // If material ID is provided, filter flashcards by material
  useEffect(() => {
    if (flashcards && materialId) {
      const filteredCards = flashcards.filter((card: Flashcard) => card.materialId === materialId);
      setDisplayedFlashcards(filteredCards);
    } else if (flashcards) {
      setDisplayedFlashcards(flashcards);
    }
  }, [flashcards, materialId]);
  
  // Set initial form values
  useEffect(() => {
    if (initialTopic) {
      form.setValue("topic", initialTopic);
    }
    if (materialId) {
      form.setValue("materialId", materialId.toString());
    }
  }, [initialTopic, materialId, form]);
  
  const onSubmit = async (data: any) => {
    setIsGenerating(true);
    
    try {
      const count = parseInt(data.count);
      const selectedMaterialId = data.materialId ? parseInt(data.materialId) : undefined;
      
      const newFlashcards = await generateFlashcards(userId, data.topic, selectedMaterialId, count);
      
      toast({
        title: "Flashcards generated!",
        description: `${newFlashcards.length} flashcards have been created.`,
      });
      
      // Refresh flashcards data
      queryClient.invalidateQueries({ queryKey: ['/api/flashcards', userId] });
      
      // Show newly generated flashcards
      setDisplayedFlashcards(newFlashcards);
      setCurrentCard(0);
      setIsFlipped(false);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePrevious = () => {
    if (displayedFlashcards.length > 0) {
      setIsFlipped(false);
      setCurrentCard((prev) => (prev === 0 ? displayedFlashcards.length - 1 : prev - 1));
    }
  };
  
  const handleNext = () => {
    if (displayedFlashcards.length > 0) {
      setIsFlipped(false);
      setCurrentCard((prev) => (prev === displayedFlashcards.length - 1 ? 0 : prev + 1));
    }
  };
  
  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };
  
  const currentFlashcard = displayedFlashcards.length > 0 ? displayedFlashcards[currentCard] : null;
  
  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter topic (e.g., Neural Networks, Organic Chemistry)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Count</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Count" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="materialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {materials?.map((material: any) => (
                          <SelectItem key={material.id} value={material.id.toString()}>
                            {material.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Generating Flashcards...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">auto_awesome</span>
                Generate Flashcards
              </>
            )}
          </Button>
        </form>
      </Form>
      
      {isLoadingFlashcards ? (
        <div className="h-64 flex items-center justify-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-neutral-200 border-t-primary rounded-full"></div>
        </div>
      ) : displayedFlashcards.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <span className="material-icons text-accent text-2xl">style</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No flashcards yet</h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-6">
            Generate your first set of flashcards by entering a topic and clicking the generate button.
          </p>
        </div>
      ) : (
        <div>
          <div 
            className="h-64 w-full cursor-pointer perspective-1000 mb-4"
            onClick={handleCardClick}
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              <div className="absolute w-full h-full bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-center p-6 backface-hidden">
                <p className="text-center font-medium text-lg">{currentFlashcard?.question}</p>
              </div>
              <div className="absolute w-full h-full bg-accent/10 rounded-xl border border-accent/20 flex items-center justify-center p-6 backface-hidden rotate-y-180">
                <div className="space-y-2 text-center">
                  <div className="text-sm space-y-1 pl-5 text-left whitespace-pre-wrap">
                    {currentFlashcard?.answer}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button 
              className="text-neutral-600 hover:text-neutral-800 flex items-center text-sm"
              onClick={handlePrevious}
            >
              <span className="material-icons text-[18px] mr-1">arrow_back</span>
              <span>Previous</span>
            </button>
            <div className="text-sm text-neutral-500">
              Card {currentCard + 1} of {displayedFlashcards.length}
            </div>
            <button 
              className="text-neutral-600 hover:text-neutral-800 flex items-center text-sm"
              onClick={handleNext}
            >
              <span>Next</span>
              <span className="material-icons text-[18px] ml-1">arrow_forward</span>
            </button>
          </div>
          <Card className="mt-8">
            <CardContent className="p-4">
              <p className="text-sm text-neutral-500 mb-2">
                <span className="material-icons text-[16px] align-text-bottom mr-1">lightbulb</span>
                Tip: Click or tap on the flashcard to see the answer
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
