import React, { useState, useRef, useEffect } from "react";
import { Square, RefreshCw, Trash, Send as SendIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { LoadingAnimation } from "./LoadingAnimation";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onStopGeneration: () => void;
  onRegenerateMessage: () => void;
  onNewSession: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onStopGeneration,
  onRegenerateMessage,
  onNewSession,
  isStreaming,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 2000;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isStreaming) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleStop = () => {
    onStopGeneration();
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="sticky bottom-0 glass-strong border-t border-white/10 p-4">
      <div className="container max-w-screen-md mx-auto space-y-3">
        {/* Sleek modern animation when streaming */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-4 justify-center">
            <LoadingAnimation size="w-24 h-24" />
            <span className="text-base text-white/80">Thinking...</span>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateMessage}
              disabled={disabled || isStreaming}
              className="flex items-center gap-2 text-sm border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:border-blue-500/50">
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onNewSession}
              disabled={disabled}
              className="flex items-center gap-2 text-sm bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30 hover:border-red-500/50">
              <Trash className="w-3 h-3" />
              New Session
            </Button>
          </div>

          {/* Character counter */}
          <div className="text-xs text-white/50">
            {message.length}/{maxLength}
          </div>
        </div>

        {/* Message input form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-3 glass border border-white/20 rounded-2xl p-3 shadow-lg focus-within:ring-2 focus-within:ring-purple-500/30 transition-all">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
              onKeyDown={handleKeyDown}
              placeholder={
                isStreaming
                  ? "Generating response..."
                  : "Ask me anything about the news..."
              }
              disabled={disabled || isStreaming}
              className="flex-1 resize-none bg-transparent border-none outline-none placeholder:text-white/50 text-white text-sm leading-6 min-h-[24px] max-h-[200px] disabled:cursor-not-allowed"
              rows={1}
            />

            <div className="flex items-center gap-2">
              {isStreaming ? (
                <Button
                  variant="destructive"
                  size="icon"
                  type="button"
                  onClick={handleStop}
                  className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30 hover:border-red-500/50">
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  type="submit"
                  disabled={!message.trim() || disabled}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30">
                  <SendIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
