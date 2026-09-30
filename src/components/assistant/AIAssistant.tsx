import {Bot,MessageCircle,Send,Sparkles,X,} from "lucide-react";
import { useState } from "react";
import type {AssistantFilters,AssistantMessage,} from "../../types/assistant";
import { askAssistant } from "../../services/assistantService";
import ChatMessage from "./ChatMessage";

const createMessageId = () =>
  `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

const createInitialMessage = (): AssistantMessage => ({
  id: "welcome",
  role: "assistant",
  text:
    "Hi! 👋 I'm ShopSphere AI. Tell me what you're shopping for and I'll help you find products.",
  createdAt: new Date().toISOString(),
});

const suggestions = [
  "Show products under ₹20,000",
  "Show highly rated products",
  "Find electronics",
  "Show cheaper options",
];

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] =useState<AssistantMessage[]>([createInitialMessage(),]);
  const [filters, setFilters] =useState<AssistantFilters>({});
  const [isTyping, setIsTyping] =useState(false);
  const sendMessage = (messageText?: string,) => {
    const text = (messageText ?? input).trim();

    if (!text || isTyping) {
      return;
    }


    const userMessage: AssistantMessage = {
      id: createMessageId(),
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setIsTyping(true);


    window.setTimeout(() => {
      const result = askAssistant(
        text,
        filters,
      );

      const assistantMessage: AssistantMessage =
      {
        id: createMessageId(),
        role: "assistant",
        text: result.message,

        productIds:
          result.products.map(
            (product) => product.id,
          ),

        createdAt:
          new Date().toISOString(),
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setFilters(result.filters);
      setIsTyping(false);
    }, 500);
  };


  const clearChat = () => {
    setMessages([
      createInitialMessage(),
    ]);

    setFilters({});
    setInput("");
    setIsTyping(false);
  };

  return (
    <>
   

      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b] text-white shadow-2xl transition hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            <div className="relative">
              <MessageCircle size={28} />

              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#ec4899]">
                <Sparkles size={12} />
              </span>
            </div>
          </button>

          {/* Tooltip */}
          <span
            className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-lg bg-[#29221b] px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
          >
            AI Assistant
          </span>
        </div>
      )}


      {isOpen && (
        <section
          aria-label="ShopSphere AI Shopping Assistant"
          className="fixed bottom-4 right-4 z-50 flex h-[calc(100vh-2rem)] max-h-[720px] w-[calc(100vw-2rem)] max-w-[440px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-orange-100 sm:bottom-6 sm:right-6 sm:h-[680px]"
        >
         

          <header className="flex items-center justify-between bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f59e0b] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                <Bot size={24} />
              </div>

              <div>
                <h2 className="font-extrabold">
                  ShopSphere AI
                </h2>

                <p className="text-xs text-white/80">
                  Your shopping assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear */}

              <button
                type="button"
                onClick={clearChat}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-white/90 transition hover:bg-white/10"
              >
                Clear
              </button>

              {/* Close */}

              <button
                type="button"
                onClick={() =>
                  setIsOpen(false)
                }
                aria-label="Close AI assistant"
                className="rounded-full p-2 transition hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>
          </header>



          <div
            className="flex-1 space-y-4 overflow-y-auto bg-[#fffaf0] p-4"
            aria-live="polite"
            aria-label="AI conversation"
          >
            {messages.map(
              (message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                />
              ),
            )}

            {/* Typing indicator */}

            {isTyping && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <Bot
                    size={18}
                    className="text-[#8b5cf6]"
                  />
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="animate-pulse">
                    ShopSphere AI is thinking...
                  </span>
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="border-t border-orange-100 bg-white px-3 py-3">
              <p className="mb-2 text-xs font-bold text-gray-500">
                Try asking:
              </p>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {suggestions.map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        sendMessage(
                          suggestion,
                        )
                      }
                      disabled={isTyping}
                      className="shrink-0 rounded-full border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-[#7c3aed] transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="border-t border-orange-100 bg-white p-3"
          >
            <div className="flex items-center gap-2 rounded-2xl bg-[#fff7ed] p-2">
              <input
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value,
                  )
                }
                placeholder="Ask me what to shop..."
                aria-label="Ask the shopping assistant"
                disabled={isTyping}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[#29221b] outline-none placeholder:text-gray-400"
              />

              <button
                type="submit"
                disabled={
                  !input.trim() ||
                  isTyping
                }
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}

export default AIAssistant;