import { cn } from "@/lib/cn";

export function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm border border-brand-100 bg-white text-brand-900",
        )}
      >
        {content}
      </div>
    </div>
  );
}
