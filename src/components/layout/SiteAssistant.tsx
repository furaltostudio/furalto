"use client";

import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, Sparkles, X } from "lucide-react";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { customFurnitureService } from "@/services/custom-furniture.service";
import { cn } from "@/lib/utils/cn";

type ChatProduct = {
  name: string;
  slug: string;
  category?: string;
  price: number;
  href: string;
  label?: string;
  blurb?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ChatProduct[];
};

const SUGGESTIONS = [
  "Suggest the best bed for me",
  "Why should I buy Nova Radiant Bed?",
  "Aurelia vs Luna Orbit compare",
  "Where is your showroom?",
];

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function isSafeInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !href.includes(":");
}

/** Render markdown links [label](/path) and bare /paths as clickable Next links. */
function renderLinkedText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((\/[^)\s]+)\)|(\/(?:products|collections|custom|showrooms|appointments|track-order|contact|trade-program|cart|wishlist)[^\s)\].,!]*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2] && isSafeInternalHref(match[2])) {
      nodes.push(
        <Link key={`md-${key++}`} href={match[2]} className="studio-chat-inline-link">
          {match[1]}
        </Link>
      );
    } else if (match[3] && isSafeInternalHref(match[3])) {
      nodes.push(
        <Link key={`path-${key++}`} href={match[3]} className="studio-chat-inline-link">
          {match[3]}
        </Link>
      );
    } else {
      nodes.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length ? nodes : [text];
}

export function SiteAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState<"gemini" | "studio" | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I’m your Furalto studio guide — craft since 1979, designed for modern Indian homes. Ask about any piece, compare options, or tell me your room.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const hidden =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account/login");

  useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, open, sending]);

  if (hidden) return null;

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = {
      id: `u-${crypto.randomUUID()}`,
      role: "user",
      content: trimmed,
    };

    const history = [...messages, userMessage]
      .filter((item) => item.id !== "welcome")
      .slice(-8)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 1200),
      }));

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setSending(true);
    setError("");

    try {
      const response = await customFurnitureService.chat({
        message: trimmed,
        history: history.slice(0, -1),
        pathname,
      });
      const reply = response.data.reply?.trim();
      if (!reply) {
        setError("Studio AI couldn’t reply just now. Try again.");
        return;
      }
      setSource(response.data.source || null);
      setMessages((current) => [
        ...current,
        {
          id: `a-${crypto.randomUUID()}`,
          role: "assistant",
          content: reply,
          products: response.data.products || [],
        },
      ]);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  return (
    <>
      <button
        type="button"
        className={cn("studio-chat-fab", open && "is-open")}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="studio-chat-panel"
        aria-label={open ? "Close Studio AI chat" : "Ask Studio AI"}
        title="Studio AI"
      >
        <span className="studio-chat-fab-ring" aria-hidden="true" />
        <span className="studio-chat-fab-surface">
          {open ? (
            <X className="studio-chat-fab-icon" size={18} strokeWidth={1.6} aria-hidden="true" />
          ) : (
            <Sparkles
              className="studio-chat-fab-icon"
              size={18}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
        </span>
        {!open ? <span className="studio-chat-fab-dot" aria-hidden="true" /> : null}
      </button>

      {open ? (
        <section
          id="studio-chat-panel"
          className="studio-chat-panel"
          aria-label="Studio AI chat"
        >
          <header className="studio-chat-head">
            <div>
              <p className="studio-chat-eyebrow">
                <Sparkles size={12} strokeWidth={1.5} aria-hidden="true" />
                Studio AI
              </p>
              <h2>Ask anything about Furalto</h2>
              <p className="studio-chat-context">
                Product advice · comparisons · studio help
                {source === "gemini"
                  ? " · Gemini"
                  : source === "studio"
                    ? " · Studio mode"
                    : ""}
              </p>
            </div>
            <button
              type="button"
              className="studio-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </header>

          <div className="studio-chat-messages" ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "studio-chat-bubble",
                  message.role === "user" ? "is-user" : "is-assistant"
                )}
              >
                <div className="studio-chat-bubble-text">
                  {renderLinkedText(message.content)}
                </div>
                {message.role === "assistant" && message.products?.length ? (
                  <div className="studio-chat-products">
                    {message.products.map((product) => (
                      <Link
                        key={product.slug}
                        href={product.href}
                        className="studio-chat-product-link"
                      >
                        <span className="studio-chat-product-name">{product.name}</span>
                        {product.blurb ? (
                          <span className="studio-chat-product-blurb">{product.blurb}</span>
                        ) : null}
                        <span className="studio-chat-product-meta">
                          {formatInr(product.price)} · View product →
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {sending ? (
              <div className="studio-chat-bubble is-assistant is-typing">
                Looking across the Furalto site…
              </div>
            ) : null}
          </div>

          {messages.length <= 1 ? (
            <div className="studio-chat-suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendMessage(suggestion)}
                  disabled={sending}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          {error ? <p className="studio-chat-error">{error}</p> : null}

          <form className="studio-chat-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="studio-chat-input">
              Ask Studio AI
            </label>
            <input
              id="studio-chat-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about a product, compare options…"
              maxLength={1000}
              disabled={sending}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label="Send message"
            >
              <Send size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
