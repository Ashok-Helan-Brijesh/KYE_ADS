// src/App.tsx
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Your Gemini API key (for testing purposes, you may later move this to .env)
const GEMINI_API_KEY = "AIzaSyB5IMrMlx-cLnuVq8cJUayFdjS-VBNiY5w";

const App = () => {
  // Optional: state for Excel data or processing indicator can live here
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnalysis = (query: string, result: any) => {
    console.log("Analysis complete for query:", query);
    console.log("Result:", result);
    // You can update charts, tables, or summaries here
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  excelData={excelData}
                  setExcelData={setExcelData}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                  geminiApiKey={GEMINI_API_KEY} // Pass the key here
                  onAnalysis={handleAnalysis}
                />
              }
            />
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
