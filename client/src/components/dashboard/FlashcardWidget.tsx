import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { generateFlashcards } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

interface FlashcardWidgetProps {
  userId: number;
  onGenerateMore: () => void;
}

export default function FlashcardWidget({ userId, onGenerateMore }: FlashcardWidgetProps) {
  const { toast } = useToast();
  const [currentCard, setCurrentCard] = useState(0);

  const { data: flashcards, isLoading, error } = useQuery({
    queryKey: ['/api/flashcards', userId],
    queryFn: async () => {
      const res = await fetch(`/api/flashcards/${userId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch flashcards');
      return res.json();
    },
  });

  const handlePrevious = () => {
    if (flashcards?.length > 0) {
      setCurrentCard((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    }
  };

  const handleNext = () => {
    if (flashcards?.length > 0) {
      setCurrentCard((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
    }
  };

  const handleGenerateMoreFlashcards = async () => {
    try {
      // Generate more flashcards for the current topic if available
      if (flashcards?.length > 0) {
        const topic = flashcards[currentCard].question.split('?')[0].trim();
        await generateFlashcards(userId, topic);
        toast({
          title: "Success!",
          description: "New flashcards have been generated.",
        });
      } else {
        // If no flashcards available, go to flashcard generation page
        onGenerateMore();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate flashcards.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Flashcards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load flashcards.</p>
        </CardContent>
      </Card>
    );
  }

  const currentFlashcard = flashcards?.length > 0 ? flashcards[currentCard] : null;

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row items-center justify-between">
        <CardTitle className="font-display font-semibold text-lg">Review Flashcards</CardTitle>
        <button 
          className="text-neutral-400 hover:text-neutral-600"
          onClick={handleGenerateMoreFlashcards}
        >
          <span className="material-icons">sync</span>
        </button>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="h-48 bg-neutral-100 animate-pulse rounded-xl"></div>
        ) : !currentFlashcard ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <p className="text-neutral-500 mb-4">No flashcards available</p>
              <Button 
                className="bg-accent/10 text-accent text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent/20 transition"
                onClick={onGenerateMore}
              >
                Create Flashcards
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flip-card h-48 w-full cursor-pointer perspective-1000">
              <div className="flip-card-inner relative w-full h-full">
                <div className="flip-card-front absolute w-full h-full bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-center p-6">
                  <p className="text-center font-medium text-lg">{currentFlashcard.question}</p>
                </div>
                <div className="flip-card-back absolute w-full h-full bg-accent/10 rounded-xl border border-accent/20 flex items-center justify-center p-6">
                  <div className="space-y-2 text-center">
                    <div className="text-sm space-y-1 pl-5 text-left whitespace-pre-wrap">
                      {currentFlashcard.answer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button 
                className="text-neutral-600 hover:text-neutral-800 flex items-center text-sm"
                onClick={handlePrevious}
              >
                <span className="material-icons text-[18px] mr-1">arrow_back</span>
                <span>Previous</span>
              </button>
              <div className="text-sm text-neutral-500">
                Card {currentCard + 1} of {flashcards.length}
              </div>
              <button 
                className="text-neutral-600 hover:text-neutral-800 flex items-center text-sm"
                onClick={handleNext}
              >
                <span>Next</span>
                <span className="material-icons text-[18px] ml-1">arrow_forward</span>
              </button>
            </div>
            <div className="mt-4 text-center">
              <Button 
                className="bg-accent/10 text-accent text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent/20 transition"
                onClick={handleGenerateMoreFlashcards}
              >
                Generate More Flashcards
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
