import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { chatWithAI } from "@/lib/openai";
import { useQuery } from "@tanstack/react-query";

interface Message {
  role: "user" | "system";
  content: string;
}

interface ChatInterfaceProps {
  userId: number;
}

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "Hi! I'm your AI Study Buddy. How can I help with your studies today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get existing conversations
  const { data: conversations } = useQuery({
    queryKey: ['/api/conversations', userId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/conversations/${userId}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch conversations');
        return res.json();
      } catch (error) {
        return [];
      }
    },
  });
  
  // Load most recent conversation if available
  useEffect(() => {
    if (conversations && conversations.length > 0 && !conversationId) {
      const recentConversation = conversations[0];
      setConversationId(recentConversation.id);
      setMessages(recentConversation.messages);
    }
  }, [conversations, conversationId]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    try {
      // Get AI response
      const response = await chatWithAI(userId, input, conversationId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update conversation ID if this is a new conversation
      if (!conversationId && response.conversation?.id) {
        setConversationId(response.conversation.id);
      }
      
      // Add AI response to chat
      const aiMessage: Message = { role: "system", content: response.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      setMessages(prev => [...prev, { 
        role: "system", 
        content: "Sorry, I'm having trouble responding right now. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleELI5Mode = () => {
    setInput(prev => {
      const newInput = prev.trim() 
        ? `Explain this in simple terms as if I'm 5 years old: ${prev}` 
        : "Can you explain a complex topic to me in simple terms?";
      return newInput;
    });
  };
  
  const handleCreateFlashcards = () => {
    setInput(prev => {
      const newInput = prev.trim() 
        ? `Generate 5 flashcards about: ${prev}` 
        : "Generate 5 flashcards about a topic we've discussed";
      return newInput;
    });
  };
  
  const handleTakeQuiz = () => {
    setInput(prev => {
      const newInput = prev.trim() 
        ? `Create a quick quiz with 3 questions about: ${prev}` 
        : "Create a quick quiz to test my knowledge";
      return newInput;
    });
  };
  
  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-start ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
              message.role === "user" 
                ? "bg-primary/20 ml-3" 
                : "bg-accent/20 mr-3"
            }`}>
              <span className={`material-icons text-sm ${
                message.role === "user" ? "text-primary" : "text-accent"
              }`}>
                {message.role === "user" ? "person" : "psychology"}
              </span>
            </div>
            <div className={`${
              message.role === "user" 
                ? "bg-primary text-white rounded-lg rounded-tr-none" 
                : "bg-neutral-100 rounded-lg rounded-tl-none"
            } p-3 max-w-[85%]`}>
              {message.content.split('\n').map((text, i) => (
                <p key={i} className="text-sm whitespace-pre-wrap">
                  {text}
                </p>
              ))}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
              <span className="material-icons text-accent text-sm">psychology</span>
            </div>
            <div className="bg-neutral-100 rounded-lg rounded-tl-none p-3">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-neutral-400 animate-[bounce_1s_infinite]"></div>
                <div className="h-2 w-2 rounded-full bg-neutral-400 animate-[bounce_1s_infinite_0.2s]"></div>
                <div className="h-2 w-2 rounded-full bg-neutral-400 animate-[bounce_1s_infinite_0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-neutral-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <button type="button" className="text-neutral-400 hover:text-neutral-600">
            <span className="material-icons">mic</span>
          </button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Ask any study question..."
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            className="bg-accent text-white rounded-lg p-2 hover:bg-accent/90 transition"
            disabled={isTyping}
          >
            <span className="material-icons">send</span>
          </Button>
        </form>
        <div className="flex mt-2 text-xs text-neutral-500 justify-between">
          <button 
            className="hover:text-accent flex items-center"
            onClick={handleELI5Mode}
          >
            <span className="material-icons text-[14px] mr-1">auto_awesome</span>
            <span>ELI5 Mode</span>
          </button>
          <button 
            className="hover:text-accent flex items-center"
            onClick={handleCreateFlashcards}
          >
            <span className="material-icons text-[14px] mr-1">forum</span>
            <span>Create Flashcards</span>
          </button>
          <button 
            className="hover:text-accent flex items-center"
            onClick={handleTakeQuiz}
          >
            <span className="material-icons text-[14px] mr-1">history_edu</span>
            <span>Take Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
}
