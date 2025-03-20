import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadPDF, extractTextFromPDF, summarizePDFContent } from "@/lib/pdf";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

interface PDFUploaderWidgetProps {
  userId: number;
}

export default function PDFUploaderWidget({ userId }: PDFUploaderWidgetProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 25 * 1024 * 1024) { // 25MB
      toast({
        title: "File too large",
        description: "Maximum file size is 25MB.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload the file
      const material = await uploadPDF(userId, selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      
      toast({
        title: "Upload successful",
        description: "Your study material has been uploaded.",
      });
      
      // Analyze the PDF
      setIsUploading(false);
      setIsAnalyzing(true);
      setAnalyzeProgress(10);
      
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(selectedFile);
      setAnalyzeProgress(50);
      
      // Generate summary using AI
      const materialId = material.id;
      await summarizePDFContent(userId, materialId, extractedText);
      setAnalyzeProgress(100);
      
      toast({
        title: "Analysis complete",
        description: "Your PDF has been analyzed and summarized.",
      });
      
      // Refresh materials list
      queryClient.invalidateQueries({ queryKey: ['/api/materials', userId] });
      
      // Reset form
      setSelectedFile(null);
      setIsAnalyzing(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: isUploading 
          ? "There was an error uploading your file." 
          : "There was an error analyzing your file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <CardTitle className="font-display font-semibold text-lg">Upload Study Material</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isUploading || isAnalyzing ? (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-icons text-primary text-2xl">
                  {isUploading ? "upload_file" : "auto_awesome"}
                </span>
              </div>
              <h3 className="font-medium text-lg mb-2">
                {isUploading ? "Uploading PDF..." : "Analyzing PDF..."}
              </h3>
              <p className="text-neutral-500 max-w-md mx-auto mb-4">
                {isUploading 
                  ? "Your file is being uploaded. Please wait..." 
                  : "Our AI is analyzing your document to generate summaries, flashcards, and practice questions..."}
              </p>
            </div>
            
            <Progress value={isUploading ? uploadProgress : analyzeProgress} className="w-full h-2" />
            <p className="text-sm text-center text-neutral-500">
              {isUploading ? `${uploadProgress}%` : `${analyzeProgress}%`}
            </p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-primary text-2xl">upload_file</span>
            </div>
            <h3 className="font-medium text-lg mb-2">
              {selectedFile ? selectedFile.name : "Drop your PDF here"}
            </h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-4">
              Upload your textbooks, notes, or any PDF and our AI will analyze it to generate summaries, flashcards, and practice questions.
            </p>
            <div className="flex justify-center gap-4">
              <label className="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition cursor-pointer">
                <span>{selectedFile ? "Change PDF" : "Select PDF"}</span>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
              {selectedFile && (
                <Button 
                  onClick={handleUpload}
                  className="bg-accent text-white font-medium hover:bg-accent/90"
                >
                  Upload & Analyze
                </Button>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-4">
              Maximum file size: 25MB. Supported format: PDF
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
