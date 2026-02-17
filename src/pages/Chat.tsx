import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Send, 
  Bot, 
  User, 
  Mic, 
  Trash2, 
  Check, 
  CheckCheck,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read";
}

const quickSuggestions = [
  "How to prevent crop diseases?",
  "Best fertilizers for my region",
  "Weather-based farming tips",
  "Organic pest control methods",
  "When to harvest wheat?",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your CropCure AI assistant. How can I help you with your farming today? आपकी खेती में आज मैं कैसे मदद कर सकता हूं?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
      status: "sending",
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Update status to sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: "sent" } : m))
      );
    }, 300);

    // Update status to delivered
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: "delivered" } : m))
      );
    }, 600);

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      
      // Update user message to read
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: "read" } : m))
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500 + Math.random() * 1000);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("disease") || lowerQuery.includes("prevent")) {
      return "To prevent crop diseases:\n\n1. **Crop Rotation**: Rotate crops every season to break disease cycles\n2. **Healthy Seeds**: Use certified disease-free seeds\n3. **Proper Spacing**: Ensure adequate spacing for air circulation\n4. **Water Management**: Avoid overwatering and water at the base\n5. **Regular Inspection**: Check crops weekly for early signs\n\nWould you like specific advice for a particular crop?";
    }
    
    if (lowerQuery.includes("fertilizer")) {
      return "For your region, I recommend:\n\n🌱 **Nitrogen (N)**: Urea or Ammonium Sulphate for leafy growth\n🌿 **Phosphorus (P)**: DAP for root development\n🌾 **Potassium (K)**: MOP for overall plant health\n\n**Organic Options**: Vermicompost, Neem cake, or cow dung manure\n\nApply fertilizers based on soil test results for best outcomes. Would you like dosage recommendations?";
    }
    
    if (lowerQuery.includes("weather") || lowerQuery.includes("rain")) {
      return "Based on current weather patterns:\n\n☀️ **This Week**: Sunny with mild temperatures (25-32°C)\n🌧️ **Rainfall**: Expected light showers mid-week\n\n**Recommendations**:\n- Complete harvesting before Wednesday\n- Delay irrigation until after rain\n- Good conditions for spraying pesticides tomorrow\n\nCheck the Weather tab for detailed 7-day forecast!";
    }
    
    if (lowerQuery.includes("pest") || lowerQuery.includes("organic")) {
      return "Organic pest control methods:\n\n🌿 **Neem Oil Spray**: Mix 5ml neem oil per liter water\n🧄 **Garlic-Chilli Spray**: Natural insect repellent\n🐞 **Beneficial Insects**: Ladybugs for aphid control\n🌼 **Companion Planting**: Marigolds deter many pests\n\n**Tip**: Apply sprays early morning or evening for best results!";
    }
    
    if (lowerQuery.includes("harvest") || lowerQuery.includes("wheat")) {
      return "Wheat harvesting guide:\n\n📅 **Timing**: 120-150 days after sowing when grain moisture is 12-14%\n\n**Signs of Maturity**:\n- Golden yellow color\n- Straw breaks easily\n- Grain is hard when bitten\n\n**Best Practice**: Harvest in dry conditions, preferably morning hours. Store in moisture-proof containers.";
    }
    
    return "Thank you for your question! I'm analyzing your query and will provide helpful farming advice. This feature will be fully implemented with AI integration.\n\nIn the meantime, you can:\n- 📸 Scan your crops for disease detection\n- 🌤️ Check weather forecasts\n- 📚 Browse educational resources\n\nHow else can I assist you?";
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Voice input functionality placeholder
    if (!isRecording) {
      // Start recording simulation
      setTimeout(() => {
        setIsRecording(false);
        setInputValue("How do I treat tomato blight?");
      }, 2000);
    }
  };

  const handleClearConversation = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Conversation cleared! How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  const MessageStatus = ({ status }: { status?: string }) => {
    if (!status) return null;
    
    switch (status) {
      case "sending":
        return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <AppLayout 
      title="AI Assistant"
      rightElement={
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all messages in this conversation. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearConversation}>
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      }
    >
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
              <div className={cn(
                "flex flex-col gap-1",
                message.role === "user" ? "items-end" : "items-start"
              )}>
                <Card
                  className={cn(
                    "max-w-[85%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  )}
                >
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                </Card>
                <div className="flex items-center gap-1 px-1">
                  <span className="text-[10px] text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.role === "user" && <MessageStatus status={message.status} />}
                </div>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <Card className="bg-card">
                <CardContent className="p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {quickSuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="whitespace-nowrap text-xs shrink-0"
              onClick={() => setInputValue(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Button 
              variant={isRecording ? "destructive" : "outline"} 
              size="icon" 
              className={cn("shrink-0", isRecording && "animate-pulse")}
              onClick={handleVoiceInput}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question..."
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isRecording && (
            <p className="text-xs text-center text-destructive mt-2 animate-pulse">
              🎤 Recording... Tap mic to stop
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
