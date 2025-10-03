import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  calculation?: {
    formula?: string;
    steps?: string[];
    result?: any;
  };
  timestamp: Date;
}

interface AthenaChatProps {
  data: any[];
  onAnalysis: (query: string, result: any) => void;
  isProcessing?: boolean;
  geminiApiKey: string;
}

const AthenaChat: React.FC<AthenaChatProps> = ({
  data,
  onAnalysis,
  isProcessing = false,
  geminiApiKey,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm Athena, your AI audit assistant powered by Gemini. I can analyze your Excel data, perform calculations, and explain how I arrived at each result. What would you like me to check?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const viewport = scrollArea.querySelector("div");
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  // 🔥 Updated Gemini API call with gemini-2.0-flash
  const callGemini = async (query: string, updatedData: any[]) => {
    if (!geminiApiKey) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: "⚠️ Error: Gemini API key is not configured.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsThinking(false);
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are Athena, an AI audit assistant. Your task is to analyze the provided JSON data based on the user's query.

                **Instructions:**
                1. Carefully analyze the data and the user's question.
                2. Provide a clear, concise natural language answer.
                3. If the query involves a calculation, you MUST also provide a JSON object detailing the steps. This JSON should be enclosed in a single markdown code block like this:
                \`\`\`json
                {
                  "formula": "e.g., SUM(Net Amount) / COUNT(Transactions)",
                  "steps": [
                    "Step 1: Description of the first step.",
                    "Step 2: Description of the second step.",
                    "Step 3: Description of the final calculation."
                  ],
                  "result": 12345.67
                }
                \`\`\`
                4. The JSON block is for structured data only. Your main answer should be the friendly, conversational text.

                **Data:**
                ${JSON.stringify(updatedData)}

                **User's Query:**
                "${query}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(
          `API Error: ${response.status} - ${
            errorBody.error?.message || "Unknown error"
          }`
        );
      }

      const result = await response.json();

      const aiMessageContent =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't process that request.";

      let parsedCalculation: Message["calculation"] | undefined = undefined;
      try {
        const jsonMatch = aiMessageContent.match(/```json([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
          parsedCalculation = JSON.parse(jsonMatch[1].trim());
        }
      } catch (err) {
        console.warn("Failed to parse calculation JSON:", err);
      }

      const cleanContent = aiMessageContent
        .replace(/```json([\s\S]*?)```/, "")
        .trim();

      const newMsg: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: cleanContent,
        calculation: parsedCalculation,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMsg]);

      if (parsedCalculation) {
        onAnalysis(query, parsedCalculation);
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: `⚠️ Error: Failed to fetch analysis. ${
          error instanceof Error ? error.message : ""
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    callGemini(input.trim(), data);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background p-2">
      <ScrollArea className="flex-1 mb-3" ref={scrollAreaRef}>
        <div className="space-y-4 pr-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "ai" && (
                <Bot className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              <div
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.calculation && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calculator className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-blue-500">
                        Calculation Details
                      </span>
                    </div>
                    {message.calculation.formula && (
                      <p className="mb-1">
                        <strong>Formula:</strong>{" "}
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                          {message.calculation.formula}
                        </code>
                      </p>
                    )}
                    {message.calculation.steps && (
                      <div className="mb-1">
                        <strong>Steps:</strong>
                        <ul className="list-decimal pl-5 mt-1 space-y-1">
                          {message.calculation.steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {message.calculation.result !== undefined && (
                      <p className="mt-2 pt-2 border-t border-blue-500/20">
                        <strong>Result:</strong>{" "}
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                          {JSON.stringify(message.calculation.result)}
                        </code>
                      </p>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-2 text-right">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex items-end gap-2 justify-start">
              <Bot className="w-5 h-5 text-muted-foreground flex-shrink-0 animate-pulse" />
              <div className="bg-card border rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t pt-2">
        {data.length === 0 && !isProcessing && (
          <p className="text-xs text-muted-foreground text-center mb-2">
            Please upload an Excel file to begin analysis.
          </p>
        )}
        <div className="flex space-x-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              data.length > 0
                ? "Ask Athena about the data..."
                : "Upload a file first..."
            }
            disabled={isThinking || isProcessing || data.length === 0}
            className="flex-1 h-9 text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={
              !input.trim() || isThinking || isProcessing || data.length === 0
            }
            size="sm"
            className="h-9 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AthenaChat;
