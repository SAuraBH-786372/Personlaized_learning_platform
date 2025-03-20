import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { summarizeContent } from "@/lib/openai";
import { queryClient } from "@/lib/queryClient";

interface SummaryProps {
  materialId: number;
  userId: number;
  summaries: Array<{
    id: number;
    content: string;
    createdAt: string;
  }>;
  isLoading: boolean;
}

export default function Summary({ materialId, userId, summaries, isLoading }: SummaryProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, we would extract content from the PDF
      // Here we simulate with example content
      const exampleContent = `
        Neural networks are computational models inspired by the human brain's structure and function.
        They consist of interconnected nodes (neurons) that process and transmit information.
        The key components include input nodes, hidden layers, and output nodes.
        Each connection between nodes has a weight that adjusts during learning.
        Activation functions determine the output of nodes based on their inputs.
        Neural networks learn through backpropagation, adjusting weights to minimize error.
        Common types include feedforward networks, convolutional networks, and recurrent networks.
        Applications range from image recognition to natural language processing and beyond.
      `;
      
      await summarizeContent(userId, materialId, exampleContent);
      
      toast({
        title: "Summary generated",
        description: "Your document has been analyzed and summarized.",
      });
      
      // Refresh summaries data
      queryClient.invalidateQueries({ queryKey: ['/api/summaries/material', materialId] });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating the summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-neutral-100 animate-pulse rounded-lg"></div>
        <div className="h-24 bg-neutral-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }
  
  if (summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <span className="material-icons text-primary text-2xl">description</span>
        </div>
        <h3 className="text-lg font-medium mb-2">No summary available</h3>
        <p className="text-neutral-500 max-w-md mx-auto mb-6">
          Generate an AI-powered summary of this document to extract key concepts and ideas.
        </p>
        <Button 
          onClick={handleGenerateSummary}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="material-icons animate-spin mr-2">refresh</span>
              Generating Summary...
            </>
          ) : (
            <>
              <span className="material-icons mr-2">auto_awesome</span>
              Generate Summary
            </>
          )}
        </Button>
      </div>
    );
  }
  
  // Sort summaries by creation date, newest first
  const sortedSummaries = [...summaries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Document Summary</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleGenerateSummary}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="material-icons animate-spin">refresh</span>
          ) : (
            <>
              <span className="material-icons mr-1">refresh</span>
              Regenerate
            </>
          )}
        </Button>
      </div>
      
      {sortedSummaries.map((summary, index) => (
        <Card key={summary.id} className={index > 0 ? "opacity-70" : ""}>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              {summary.content.split("\n").map((paragraph, i) => (
                <p key={i} className={i === 0 ? "font-medium" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
            {index === 0 && (
              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="outline" size="sm">
                  <span className="material-icons mr-1">play_circle</span>
                  Listen
                </Button>
                <Button variant="outline" size="sm">
                  <span className="material-icons mr-1">content_copy</span>
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <span className="material-icons mr-1">download</span>
                  Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
