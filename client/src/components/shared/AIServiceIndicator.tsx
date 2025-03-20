import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getAIStatus } from "@/lib/openai";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SparklesIcon } from "lucide-react";

export function AIServiceIndicator() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/ai/status"],
    queryFn: () => getAIStatus(),
  });

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <SparklesIcon className="w-3 h-3 mr-1" />
        AI: Loading...
      </Badge>
    );
  }

  if (error || !data?.available) {
    return (
      <Badge variant="destructive">
        <SparklesIcon className="w-3 h-3 mr-1" />
        AI: Unavailable
      </Badge>
    );
  }

  const aiStatusColor = 
    data.service === "OpenAI" ? "bg-gradient-to-r from-green-400 to-blue-500" :
    data.service === "Gemini" ? "bg-gradient-to-r from-blue-400 to-purple-500" :
    "bg-gray-500";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={aiStatusColor + " text-white"}>
            <SparklesIcon className="w-3 h-3 mr-1" />
            AI: {data.service}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Using {data.service} for AI features</p>
          {data.service === "Gemini" && (
            <p className="text-xs text-muted-foreground mt-1">
              (Fallback from OpenAI)
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}