import * as pdfjsLib from 'pdfjs-dist';
import { apiRequest } from "./queryClient";

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Upload a PDF file
export async function uploadPDF(userId: number, file: File, onProgress?: (progress: number) => void) {
  return new Promise<any>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const fileContent = event.target.result;
        const base64Content = fileContent.toString().split(',')[1];
        
        const response = await apiRequest("POST", "/api/materials", {
          userId,
          title: file.name,
          description: `Uploaded on ${new Date().toLocaleString()}`,
          file: base64Content,
        });
        
        const result = await response.json();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    if (onProgress) {
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }
    
    reader.readAsDataURL(file);
  });
}

// Extract text from PDF
export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        
        let extractedText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          extractedText += pageText + '\n\n';
        }
        
        resolve(extractedText);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Summarize a PDF
export async function summarizePDF(userId: number, materialId: number, file: File) {
  try {
    const extractedText = await extractTextFromPDF(file);
    return await summarizePDFContent(userId, materialId, extractedText);
  } catch (error) {
    throw new Error(`Failed to summarize PDF: ${error}`);
  }
}

// Summarize PDF content using AI
export async function summarizePDFContent(userId: number, materialId: number, content: string) {
  try {
    const response = await apiRequest("POST", "/api/ai/summarize", {
      userId,
      materialId,
      content
    });
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to get AI summary: ${error}`);
  }
}
