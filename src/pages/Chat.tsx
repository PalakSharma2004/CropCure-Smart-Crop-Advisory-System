import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your CropCare AI assistant. How can I help you with your farming today? आपकी खेती में आज मैं कैसे मदद कर सकता हूं?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Thank you for your question! I'm analyzing your query and will provide helpful farming advice shortly. This feature will be fully implemented with AI integration.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <AppLayout title="AI Assistant">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <Card
                className={cn(
                  "max-w-[80%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                )}
              >
                <CardContent className="p-3">
                  <p className="text-sm">{message.content}</p>
                </CardContent>
              </Card>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto">
          {["What's affecting my tomatoes?", "Best time to water crops?", "Fertilizer recommendations"].map(
            (suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs"
                onClick={() => setInputValue(suggestion)}
              >
                {suggestion}
              </Button>
            )
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="shrink-0">
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend} disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
