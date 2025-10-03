// src/pages/Index.tsx
import React, { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import AthenaChat from "@/components/AthenaChat";
import DataPreview from "@/components/DataPreview";
import DefineHeaders from "@/components/DefineHeaders";

// Define the props that Index receives from App.tsx
interface IndexProps {
  excelData: any[];
  setExcelData: React.Dispatch<React.SetStateAction<any[]>>;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  geminiApiKey: string;
  onAnalysis: (query: string, result: any) => void;
}

const Index: React.FC<IndexProps> = ({
  excelData,
  setExcelData,
  isProcessing,
  setIsProcessing,
  geminiApiKey,
  onAnalysis,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFileUploaded = (file: File, data: any[]) => {
    setUploadedFile(file);
    setExcelData(data);
    setAnalysisResult(null);

    if (data.length > 0) {
      const extractedHeaders = Object.keys(data[0]).map(
        (header, index) => header || `Column_${index + 1}`
      );
      setHeaders(extractedHeaders);
    }
  };

  const handleAnalysis = (query: string, result: any) => {
    setAnalysisResult(result);
    onAnalysis(query, result); // forward to App.tsx callback
  };

  const handleHeadersUpdate = (updatedHeaders: string[]) => {
    const sanitizedHeaders = updatedHeaders.map(
      (header, index) => header.trim() || `Column_${index + 1}`
    );
    setHeaders(sanitizedHeaders);

    const updatedData = excelData.map((row) => {
      const newRow: any = {};
      Object.keys(row).forEach((oldHeader, index) => {
        newRow[sanitizedHeaders[index]] = row[oldHeader];
      });
      return newRow;
    });
    setExcelData(updatedData);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[60%_40%] gap-2 w-full p-2">
        {/* File Upload Section */}
        <Card className="p-4 shadow-sm h-[440px] flex flex-col">
          <FileUpload
            onFileUploaded={handleFileUploaded}
            isLoading={isProcessing}
          />
        </Card>

        {/* Chat with Athena */}
        <Card className="p-4 shadow-sm h-[440px] flex flex-col">
          <div className="text-center mb-2">
            <div className="inline-flex items-center gap-0.5 bg-muted px-0.5 py-0.5 rounded-md">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Chat with Athena</span>
            </div>
          </div>
          <AthenaChat
            data={excelData}
            onAnalysis={handleAnalysis}
            isProcessing={isProcessing}
            geminiApiKey={geminiApiKey}
          />
        </Card>

        {/* Data Preview */}
        <Card className="p-4 shadow-sm h-[440px] flex flex-col">
          <div className="text-center mb-2">
            <div className="inline-flex items-center gap-2 bg-muted px-2 py-1 rounded-md">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Excel Data View</span>
            </div>
          </div>
          <div className="overflow-auto max-h-[calc(100%-2rem)]">
            <DataPreview
              data={excelData}
              fileName={uploadedFile?.name || "Uploaded File"}
              analysisResult={analysisResult}
            />
          </div>
        </Card>

        {/* Define Headers */}
        <Card className="p-4 shadow-sm h-[440px] flex flex-col">
          <DefineHeaders
            headers={headers}
            onHeadersUpdate={handleHeadersUpdate}
          />
        </Card>
      </main>
    </div>
  );
};

export default Index;
