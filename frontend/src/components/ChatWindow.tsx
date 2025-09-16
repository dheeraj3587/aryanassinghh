import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Bot,
  Brain,
  Sparkles,
  Newspaper,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { ChatMessage } from "../services/api";
import { LoadingAnimation } from "./LoadingAnimation";

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage?: (message: string) => void;
}

export function ChatWindow({
  messages,
  isStreaming,
  onSendMessage,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = (force = false) => {
    if (messagesEndRef.current && (!isUserScrolling || force)) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [isStreaming]);

  // Handle scroll events to detect user scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

      setShowScrollButton(!isAtBottom);

      // Detect if user is actively scrolling (not at bottom)
      setIsUserScrolling(!isAtBottom);

      // Reset user scrolling state after a delay
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isAtBottom) {
          setIsUserScrolling(false);
        }
      }, 1000);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleScrollToBottom = () => {
    setIsUserScrolling(false);
    scrollToBottom(true);
  };

  return (
    <div className="flex-1 relative">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-full overflow-y-auto scroll-smooth">
        <div className="container max-w-4xl mx-auto py-6 px-4 space-y-4">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center py-16 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-2xl">
                <Brain className="w-10 h-10 text-blue-400" />
              </motion.div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Welcome to NewsFlow AI
                </h2>
                <p className="text-neutral-300 max-w-md mx-auto text-base leading-relaxed">
                  Your intelligent news companion. Ask me anything about recent
                  events, and I'll analyze the latest information to provide you
                  with accurate, contextual insights.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-10">
                {[
                  {
                    text: "What's happening in tech today?",
                    icon: Sparkles,
                  },
                  {
                    text: "Recent developments in climate policy",
                    icon: Newspaper,
                  },
                  {
                    text: "Latest sports news highlights",
                    icon: MessageCircle,
                  },
                  { text: "Current market trends", icon: Brain },
                ].map((suggestion, index) => {
                  const IconComponent = suggestion.icon;
                  return (
                    <motion.div
                      key={suggestion.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl text-sm text-neutral-200 hover:from-blue-600/20 hover:to-purple-600/20 hover:border-blue-500/40 hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] group"
                      onClick={() => {
                        if (onSendMessage) {
                          onSendMessage(suggestion.text);
                        }
                      }}>
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        <span className="font-medium">{suggestion.text}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    index={index}
                    isStreaming={
                      isStreaming &&
                      index === messages.length - 1 &&
                      message.role === "assistant"
                    }
                  />
                ))}
              </AnimatePresence>

              {/* Show thinking animation whenever streaming */}
              {isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex gap-4 items-center">
                  <div className="bg-neutral-800 border border-neutral-700 w-8 h-8 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white/80" />
                  </div>
                  <LoadingAnimation size="w-16 h-16" />
                  <span className="text-neutral-300 text-base">
                    Searching latest news...
                  </span>
                </motion.div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            onClick={handleScrollToBottom}
            className="absolute bottom-4 right-4 w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-purple-800 transition-all flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Scroll to latest message">
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
