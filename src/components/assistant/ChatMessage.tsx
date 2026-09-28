import {
  Bot,
  User,
} from "lucide-react";

import type { AssistantMessage } from "../../types/assistant";

import { products } from "../../data/products";

import AssistantProductCard from "./AssistantProductCard";

interface ChatMessageProps {
  message: AssistantMessage;
}

function ChatMessage({
  message,
}: ChatMessageProps) {
  const isUser =
    message.role === "user";

  const messageProducts =
    message.productIds
      ?.map((id) =>
        products.find(
          (product) =>
            product.id === id,
        ),
      )
      .filter(
        (
          product,
        ): product is (typeof products)[number] =>
          Boolean(product),
      ) ?? [];

  return (
    <div
      className={`flex gap-3 ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] text-white">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`max-w-[90%] ${
          isUser
            ? "rounded-2xl rounded-br-md bg-gradient-to-r from-[#f59e0b] to-[#ec4899] text-white"
            : "rounded-2xl rounded-bl-md bg-[#fff7ed] text-[#29221b]"
        } p-3`}
      >
        <p className="text-sm leading-6">
          {message.text}
        </p>

        {messageProducts.length >
          0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {messageProducts.map(
              (product) => (
                <AssistantProductCard
                  key={product.id}
                  product={product}
                />
              ),
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#29221b] text-white">
          <User size={18} />
        </div>
      )}
    </div>
  );
}

export default ChatMessage;