import { useState } from "react";
import { Copy, User, Bot, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ChatMessage } from "../services/api";

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  isStreaming?: boolean;
}

export function MessageBubble({
  message,
  index,
  isStreaming,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`flex gap-3 group ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/30"
            : "bg-neutral-800 border border-neutral-700"
        }`}>
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-white/80" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`flex-1 space-y-1 ${isUser ? "text-right" : "text-left"}`}>
        {/* Timestamp and copy button */}
        <div
          className={`flex items-center gap-2 ${
            isUser ? "justify-end" : "justify-start"
          }`}>
          <span className="text-[10px] text-neutral-500">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          <motion.button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-700 focus-ring transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Copy message">
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2 }}>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2 }}>
                  <Copy className="w-3 h-3 text-neutral-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Message bubble */}
        <motion.div
          whileHover={{ scale: 1.005, y: -0.5 }}
          transition={{ duration: 0.15 }}
          className={`rounded-2xl p-4 ${
            isUser
              ? "bg-neutral-800 text-white border border-neutral-700"
              : "bg-neutral-800/50 text-white border border-neutral-700"
          }`}>
          {isUser ? (
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="prose max-w-none prose-sm prose-invert prose-pre:!bg-neutral-900 prose-pre:!text-white prose-pre:!border prose-pre:!border-neutral-600 prose-code:!bg-neutral-700 prose-code:!text-white prose-code:!before:content-[''] prose-code:!after:content-[''] prose-hr:!border-neutral-600 prose-blockquote:!border-l-neutral-500 prose-blockquote:!text-neutral-300 prose-headings:!text-white prose-strong:!text-white prose-a:!text-purple-400 prose-a:hover:!text-purple-300">
              {isStreaming && !message.content ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-neutral-600">
                    <div className="flex items-center justify-center w-full h-full bg-neutral-900">
                      <div className="w-10 h-10">
                        {/* Reuse loading animation visually via ChatWindow when needed; keep bubble minimal */}
                        <div className="w-full h-full rounded-full border-2 border-purple-500/40 border-t-transparent animate-spin" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-neutral-300 text-sm font-medium">
                      Searching latest news...
                    </span>
                    <span className="text-neutral-500 text-xs">
                      Using RAG to find relevant articles
                    </span>
                  </div>
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code: ({ inline, className, children, ...props }: any) => {
                      if (inline) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div className="relative">
                          <pre
                            className={`${className} !bg-neutral-900 !p-3 !rounded-lg overflow-x-auto !border !border-neutral-600`}
                            {...props}>
                            <code>{children}</code>
                          </pre>
                        </div>
                      );
                    },
                  }}>
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex gap-4 items-center">
      <div className="w-8 h-8 rounded-full glass border border-white/20 flex items-center justify-center shadow-lg">
        <Bot className="w-4 h-4 text-white/80" />
      </div>

      <div className="glass border border-white/10 rounded-2xl p-4 shadow-lg">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white/60 rounded-full"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
