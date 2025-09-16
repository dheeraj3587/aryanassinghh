import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Clock, Sparkles, History } from "lucide-react";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";

interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp?: string;
  messageCount?: number;
}

interface ChatSidebarProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
}

export function ChatSidebar({
  isOpen,
  setOpen,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
}: ChatSidebarProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-neutral-900 border-r border-neutral-800 z-[70] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <Logo size="md" />
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-4 border-b border-neutral-800">
              <button
                onClick={() => {
                  onNewSession();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl text-white hover:from-blue-600/30 hover:to-purple-600/30 transition-all group shadow-lg">
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="font-semibold">Start New Chat</span>
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-neutral-300 text-sm font-medium mb-1">
                    No conversations yet
                  </p>
                  <p className="text-neutral-500 text-xs">
                    Start chatting to see your history here
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {sessions.map((session) => (
                    <motion.button
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onSelectSession(session.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-all group",
                        currentSessionId === session.id
                          ? "bg-blue-500/20 border border-blue-500/30 shadow-lg"
                          : "hover:bg-neutral-800 border border-transparent hover:border-neutral-700",
                      )}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">
                            {session.title}
                          </h3>
                          {session.lastMessage && (
                            <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                              {session.lastMessage}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-neutral-500" />
                            <span className="text-xs text-neutral-500">
                              {session.timestamp &&
                                formatTime(session.timestamp)}
                            </span>
                            {session.messageCount && (
                              <>
                                <span className="text-xs text-neutral-500">
                                  •
                                </span>
                                <span className="text-xs text-neutral-500">
                                  {session.messageCount} messages
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement delete functionality
                            console.log("Delete session:", session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all">
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-800">
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">NewsFlow AI Online</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Powered by advanced AI intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
