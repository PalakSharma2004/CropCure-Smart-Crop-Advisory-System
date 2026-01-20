import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read" | "error";
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your CropCare AI assistant. How can I help you with your farming today? आपकी खेती में आज मैं कैसे मदद कर सकता हूं?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load chat history from database on mount
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const loadedMessages: ChatMessage[] = data.flatMap((conv) => {
          const msgs: ChatMessage[] = [
            {
              id: `${conv.id}-user`,
              role: "user",
              content: conv.message_content,
              timestamp: new Date(conv.created_at),
              status: "read",
            },
          ];
          if (conv.response_content) {
            msgs.push({
              id: `${conv.id}-assistant`,
              role: "assistant",
              content: conv.response_content,
              timestamp: new Date(conv.created_at),
            });
          }
          return msgs;
        });

        setMessages((prev) => [prev[0], ...loadedMessages]);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  const saveChatMessage = async (userMessage: string, assistantResponse: string) => {
    if (!user) return;

    try {
      await supabase.from("chat_conversations").insert({
        user_id: user.id,
        message_content: userMessage,
        response_content: assistantResponse,
        message_type: "text",
      });
    } catch (err) {
      console.error("Error saving chat message:", err);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    setError(null);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);

    // Update status to sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: "sent" } : m))
      );
    }, 300);

    // Update status to delivered
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: "delivered" } : m))
      );
    }, 600);

    setIsTyping(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Prepare messages for API
      const apiMessages = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));
      apiMessages.push({ role: "user", content: content.trim() });

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId: user?.id,
          language: "en", // Could be dynamic based on user preferences
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        }
        if (response.status === 402) {
          throw new Error("AI service quota exceeded. Please try again later.");
        }
        throw new Error("Failed to get response");
      }

      // Update user message to read
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: "read" } : m))
      );

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream");
      }

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantMessageId = (Date.now() + 1).toString();

      // Add empty assistant message to stream into
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      let buffer = "";
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (readerDone) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            done = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            // Incomplete JSON, put back in buffer
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save to database
      if (assistantContent) {
        saveChatMessage(content.trim(), assistantContent);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Request was cancelled
      }

      const message = err instanceof Error ? err.message : "Failed to send message";
      setError(message);
      
      // Update user message status to error
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: "error" } : m))
      );

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  }, [messages, isTyping, user, toast]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
    }
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Conversation cleared! How can I help you today? आज मैं आपकी कैसे मदद कर सकता हूं?",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      // Remove the failed message and retry
      setMessages((prev) => prev.filter((m) => m.id !== lastUserMessage.id));
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    cancelRequest,
    clearConversation,
    retryLastMessage,
  };
}
