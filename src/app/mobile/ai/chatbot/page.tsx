"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { getMockResponse } from "@/lib/ai/mock-chatbot";
import { randomDelay } from "@/lib/ai/simulate-delay";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  quickReplies?: string[];
}

const GREETING: ChatMessage = {
  id: "greet",
  role: "assistant",
  content:
    "Hi! I'm Pally, your AI travel buddy. Ask me anything about destinations, packing, visas, or let me suggest trips you'll love.",
  quickReplies: [
    "Find a trip",
    "Packing tips",
    "Visa info",
    "Budget help",
  ],
};

export default function MobileChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await randomDelay(700, 1400);

    const response = getMockResponse(text);
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: response.content,
        quickReplies: response.quickReplies,
      },
    ]);
    setTyping(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title="Pally AI"
        action={
          <div className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </div>
        }
      />

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id}>
            {m.role === "assistant" ? (
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shrink-0">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border px-3.5 py-2.5">
                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {m.content}
                    </p>
                  </div>
                  {m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                      {m.quickReplies.map((q) => (
                        <button
                          key={q}
                          onClick={() => send(q)}
                          className="rounded-full border bg-white px-3 py-1 text-[11px] font-medium text-primary hover:bg-primary/5 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5">
                  <p className="text-sm text-white whitespace-pre-line leading-relaxed">
                    {m.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="flex items-start gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary shrink-0">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white border px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-[bounce-dot_1.4s_infinite_ease-in-out]"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI links when empty / early */}
        {messages.length <= 1 && !typing && (
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-primary/5 border border-violet-100 p-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <p className="text-xs font-bold text-violet-900">
                Try Pally with these
              </p>
            </div>
            <div className="space-y-1.5">
              {[
                "What should I pack for Iceland?",
                "Best time to visit Bali?",
                "Do I need a visa for Japan?",
                "Recommend me a 7-day trip under $2500",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="block w-full text-left text-xs text-violet-900 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 hover:bg-white transition-colors"
                >
                  &quot;{q}&quot;
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-0 bg-white border-t p-3 md:pb-8"
      >
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Pally anything..."
            className="h-11 rounded-full bg-muted/50 border-0 px-4"
            disabled={typing}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-full shrink-0"
            disabled={!input.trim() || typing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
