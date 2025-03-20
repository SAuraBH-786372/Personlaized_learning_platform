import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface PdfViewerProps {
  material: any;
  onProgressUpdate: (progress: number) => void;
}

export default function PdfViewer({ material, onProgressUpdate }: PdfViewerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfUrl, setPdfUrl] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    if (!material) return;
    
    // In a real implementation, this would use the actual file path
    // For this implementation, we'll use a placeholder PDF URL
    const url = material.filePath || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    setPdfUrl(url);
    
    // Initialize with saved progress
    if (material.progress) {
      const estimatedPage = Math.ceil((material.progress / 100) * 10); // Assuming 10 pages for example
      setCurrentPage(estimatedPage || 1);
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTotalPages(10); // For demonstration
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [material]);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      
      // Calculate progress percentage
      const progress = Math.floor((newPage / totalPages) * 100);
      onProgressUpdate(progress);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    const newPage = Math.ceil((newProgress / 100) * totalPages);
    
    setCurrentPage(newPage);
    onProgressUpdate(newProgress);
  };
  
  if (!material) {
    return (
      <div className="p-6 text-center">
        <p>No material selected</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <span className="material-icons">arrow_back</span>
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            <span className="material-icons">arrow_forward</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-500">Progress:</span>
          <div className="w-48 flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              value={material.progress || 0}
              onChange={handleProgressChange}
              className="w-full"
            />
            <span className="text-sm w-9">{material.progress || 0}%</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-neutral-200 border-t-primary rounded-full mb-4"></div>
              <p>Loading PDF...</p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full border-0"
            title={material.title}
          />
        )}
      </div>
    </div>
  );
}
