"use client";

import { AlertCircle, Loader2, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import type { ChatRole } from "@/lib/api/types";

type Message = { role: ChatRole; content: string };

const EXAMPLE_PROMPTS = [
  "What's my biggest source of emissions?",
  "How many times have I logged transport?",
  "Any tips to lower my footprint?",
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setError(null);
    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await apiFetch<{ reply: string }>("/chat", {
        method: "POST",
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-12),
        }),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't get a reply. Try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div>
        <h1 className="text-xl font-semibold text-brand-950">Ask AI</h1>
        <p className="mt-1 text-sm text-brand-700/70">Ask anything about your footprint — grounded in your own data.</p>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Sparkles className="size-6" aria-hidden />
            </div>
            <p className="text-sm text-brand-700/70">Try one of these, or ask your own question.</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-left text-sm text-brand-800 transition-colors hover:bg-brand-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <ChatBubble key={i} role={m.role} content={m.content} />)
        )}

        {isSending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-brand-100 bg-white px-4 py-2.5 text-brand-500">
              <Loader2 className="size-4 animate-spin" aria-hidden />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="sticky bottom-2 mt-4 flex gap-2 rounded-2xl border border-brand-100 bg-white p-2 shadow-card"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your footprint..."
          className="min-w-0 flex-1 bg-transparent px-2.5 text-base text-brand-950 placeholder:text-brand-950/35 outline-none"
        />
        <Button type="submit" size="sm" isLoading={isSending} disabled={!input.trim()} aria-label="Send">
          <Send className="size-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
