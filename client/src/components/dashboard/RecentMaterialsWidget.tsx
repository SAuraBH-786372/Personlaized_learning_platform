import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { uploadPDF } from "@/lib/pdf";

interface StudyMaterial {
  id: number;
  title: string;
  lastViewed: string;
  progress: number;
}

interface RecentMaterialsWidgetProps {
  userId: number;
  onMaterialSelect: (id: number) => void;
}

export default function RecentMaterialsWidget({ userId, onMaterialSelect }: RecentMaterialsWidgetProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: materials, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/materials', userId],
    queryFn: async () => {
      const res = await fetch(`/api/materials/${userId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch study materials');
      return res.json();
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      await uploadPDF(userId, file, (progress) => {
        setUploadProgress(progress);
      });
      
      toast({
        title: "Upload successful",
        description: "Your study material has been uploaded.",
      });
      
      refetch();
      setUploadDialogOpen(false);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getProgressColorClass = (progress: number) => {
    if (progress >= 75) return "bg-secondary/10 text-secondary";
    if (progress >= 40) return "bg-primary/10 text-primary";
    return "bg-warning/10 text-warning";
  };

  const formatLastViewed = (dateString: string) => {
    if (!dateString) return "Never viewed";
    
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return `${formatDistanceToNow(date, { addSuffix: true })}`;
    }
    
    if (date > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      return `${formatDistanceToNow(date, { addSuffix: true })}`;
    }
    
    return `on ${format(date, 'MMM d, yyyy')}`;
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Study Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load study materials.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row items-center justify-between">
        <CardTitle className="font-display font-semibold text-lg">Recent Study Materials</CardTitle>
        <button className="text-neutral-400 hover:text-neutral-600">
          <span className="material-icons">more_horiz</span>
        </button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              <div className="h-24 bg-neutral-100 animate-pulse rounded-lg"></div>
              <div className="h-24 bg-neutral-100 animate-pulse rounded-lg"></div>
            </>
          ) : (
            <>
              {materials?.slice(0, 3).map((material: StudyMaterial) => (
                <div 
                  key={material.id}
                  onClick={() => onMaterialSelect(material.id)}
                  className="group flex bg-neutral-50 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                >
                  <div className="pdf-thumbnail bg-neutral-200 w-20 flex-shrink-0 flex items-center justify-center">
                    <span className="material-icons text-neutral-500">picture_as_pdf</span>
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{material.title}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Last viewed: {formatLastViewed(material.lastViewed)}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className={`text-xs ${getProgressColorClass(material.progress)} px-2 py-0.5 rounded-full`}>
                        {material.progress}% completed
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <div className="flex items-center justify-center h-40 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200 hover:border-primary/50 transition-colors group cursor-pointer">
                    <div className="text-center">
                      <span className="material-icons text-3xl text-neutral-400 group-hover:text-primary">upload_file</span>
                      <p className="mt-2 text-sm font-medium text-neutral-600 group-hover:text-primary">Upload New Material</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <h2 className="text-xl font-semibold mb-4">Upload Study Material</h2>
                  <div className="space-y-4">
                    {isUploading ? (
                      <div className="space-y-2">
                        <p className="text-sm">Uploading... {uploadProgress}%</p>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center">
                        <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <span className="material-icons text-primary text-2xl">upload_file</span>
                        </div>
                        <h3 className="font-medium text-lg mb-2">Drop your PDF here</h3>
                        <p className="text-neutral-500 max-w-md mx-auto mb-4">
                          Upload your textbooks, notes, or any PDF and our AI will analyze it to generate summaries, flashcards, and practice questions.
                        </p>
                        <div className="flex justify-center">
                          <label className="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition cursor-pointer">
                            <span>Select PDF</span>
                            <input 
                              type="file" 
                              accept=".pdf" 
                              className="hidden" 
                              onChange={handleFileUpload}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-neutral-400 mt-4">
                          Maximum file size: 25MB. Supported format: PDF
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
