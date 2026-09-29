import {
  Bot,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { useState } from "react";

import type {
  AssistantFilters,
  AssistantMessage,
} from "../../types/assistant";

import type { Product } from "../../types/product";

import { products } from "../../data/products";

import { askAssistant } from "../../services/assistantService";

import ChatMessage from "./ChatMessage";

/* =========================================================
   HELPERS
========================================================= */

const createMessageId = () =>
  `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

/* =========================================================
   INITIAL MESSAGE
========================================================= */

const createInitialMessage = (): AssistantMessage => ({
  id: "welcome",
  role: "assistant",
  text:
    "Hi! 👋 I'm ShopSphere AI. Tell me what you're shopping for and I'll help you find the right products.",
  createdAt: new Date().toISOString(),
});

/* =========================================================
   SUGGESTIONS
========================================================= */

const suggestions = [
  "Show mobiles under ₹30000",
  "Show laptops under ₹50000",
  "Find shoes under ₹2000",
  "Show highly rated products",
];

/* =========================================================
   COMPONENT
========================================================= */

function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<AssistantMessage[]>([
    createInitialMessage(),
  ]);

  const [filters, setFilters] =
    useState<AssistantFilters>({});

  const [isTyping, setIsTyping] =
    useState(false);

  /* =======================================================
     GET PREVIOUS PRODUCTS
  ======================================================= */

  const getPreviousProducts = (): Product[] => {
    /*
     * Find the latest assistant message
     * that contains product recommendations.
     */
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(
        (message) =>
          message.role === "assistant" &&
          message.productIds &&
          message.productIds.length > 0,
      );

    if (!lastAssistantMessage?.productIds) {
      return [];
    }

    return lastAssistantMessage.productIds
      .map((id) =>
        products.find(
          (product) => product.id === id,
        ),
      )
      .filter(
        (product): product is Product =>
          Boolean(product),
      );
  };

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendMessage = (messageText?: string) => {
    const text = (
      messageText ?? input
    ).trim();

    if (!text || isTyping) {
      return;
    }

    /* -----------------------------------------------------
       USER MESSAGE
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       SAVE PREVIOUS PRODUCTS BEFORE TIMEOUT
    ----------------------------------------------------- */

    const previousProducts =
      getPreviousProducts();

    /* -----------------------------------------------------
       ASSISTANT RESPONSE
    ----------------------------------------------------- */

    window.setTimeout(() => {
      const result = askAssistant(
        text,
        filters,
        previousProducts,
      );

      const assistantMessage: AssistantMessage = {
        id: createMessageId(),
        role: "assistant",
        text: result.message,
        productIds: result.products.map(
          (product) => product.id,
        ),
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setFilters(result.filters);

      setIsTyping(false);
    }, 500);
  };

  /* =======================================================
     CLEAR CHAT
  ======================================================= */

  const clearChat = () => {
    setMessages([
      {
        ...createInitialMessage(),
        id: createMessageId(),
      },
    ]);

    setFilters({});
    setInput("");
    setIsTyping(false);
  };

  /* =======================================================
     OPEN ASSISTANT
  ======================================================= */

  const openAssistant = () => {
    setIsOpen(true);
  };

  /* =======================================================
     CLOSE ASSISTANT
  ======================================================= */

  const closeAssistant = () => {
    setIsOpen(false);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          FLOATING AI ASSISTANT BUTTON
      =================================================== */}

      {!isOpen && (
        <div className="group fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={openAssistant}
            aria-label="Open AI Assistant"
            title="AI Assistant"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b] text-white shadow-2xl transition duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300"
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

      {/* ===================================================
          ASSISTANT WINDOW
      =================================================== */}

      {isOpen && (
        <section
          aria-label="ShopSphere AI Shopping Assistant"
          className="fixed bottom-4 right-4 z-50 flex h-[calc(100vh-2rem)] max-h-[720px] w-[calc(100vw-2rem)] max-w-[440px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-orange-100 sm:bottom-6 sm:right-6 sm:h-[680px]"
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="flex items-center justify-between bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#f59e0b] p-4 text-white">
            {/* Logo + Title */}

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

            {/* Header Actions */}

            <div className="flex items-center gap-1">
              {/* Clear */}

              <button
                type="button"
                onClick={clearChat}
                disabled={isTyping}
                title="Clear chat"
                className="rounded-lg px-2 py-1 text-xs font-semibold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>

              {/* Close */}

              <button
                type="button"
                onClick={closeAssistant}
                aria-label="Close AI assistant"
                title="Close AI Assistant"
                className="rounded-full p-2 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-[#fffaf0] p-4"
            aria-live="polite"
            aria-label="AI conversation"
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
              />
            ))}

            {/* Typing Indicator */}

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

          {/* =================================================
              SUGGESTIONS
          ================================================= */}

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

          {/* =================================================
              INPUT
          ================================================= */}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="border-t border-orange-100 bg-white p-3"
          >
            <div className="flex items-center gap-2 rounded-2xl bg-[#fff7ed] p-2">
              {/* Input */}

              <input
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="Ask me what to shop..."
                aria-label="Ask the shopping assistant"
                disabled={isTyping}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[#29221b] outline-none placeholder:text-gray-400"
              />

              {/* Send */}

              <button
                type="submit"
                disabled={
                  !input.trim() ||
                  isTyping
                }
                aria-label="Send message"
                title="Send message"
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

export default ShoppingAssistant;