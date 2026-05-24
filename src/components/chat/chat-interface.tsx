"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QUICK_REPLIES } from "@/prompts/receptionist";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  businessId: string;
  businessName?: string;
}

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("chat_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("chat_session_id", id);
  }
  return id;
}

export function ChatInterface({ businessId, businessName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm the AI receptionist${businessName ? ` for ${businessName}` : ""}. I can help you book an appointment or answer questions. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          message: text.trim(),
          session_id: getSessionId(),
          history: messages,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card shadow-lg">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold">AI Receptionist</p>
          <p className="text-xs text-muted-foreground">
            {businessName || "Online now"}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" style={{ height: "400px" }}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="flex gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex flex-wrap gap-2 border-t px-4 py-2">
        {QUICK_REPLIES.map((reply) => (
          <Button
            key={reply}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => sendMessage(reply)}
            disabled={loading}
          >
            {reply}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 border-t p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          disabled={loading}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
