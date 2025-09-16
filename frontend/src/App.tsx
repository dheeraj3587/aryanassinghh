import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChatWindow } from "./components/ChatWindow";
import { MessageInput } from "./components/MessageInput";
import { ChatSidebar } from "./components/ChatSidebar";
import { TopNavbar } from "./components/TopNavbar";
import { WelcomeSplash } from "./components/WelcomeSplash";
import { useChat } from "./hooks/useChat";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    messages,
    sessionId,
    isStreaming,
    sendMessage,
    stopGeneration,
    regenerateLastMessage,
    newSession,
    switchToSession,
  } = useChat();

  const [showSplash, setShowSplash] = useState(true);

  const sidebarSessions = useMemo(() => {
    const stored = localStorage.getItem("rag-chat-sessions");
    if (!stored) return [] as { id: string; title: string }[];
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({ id: s.id, title: s.title })) as {
        id: string;
        title: string;
      }[];
    } catch {
      return [] as { id: string; title: string }[];
    }
  }, [sessionId, messages.length]);

  useEffect(() => {
    // Auto close splash if already ran once this session
    if (sessionStorage.getItem("splash-done")) {
      setShowSplash(false);
    }
  }, []);

  // Global handlers for navbar events
  useEffect(() => {
    const openSidebar = () => setSidebarOpen(true);
    const newChat = () => newSession();
    window.addEventListener("topnav:open-sidebar", openSidebar);
    window.addEventListener("topnav:new-chat", newChat);
    return () => {
      window.removeEventListener("topnav:open-sidebar", openSidebar);
      window.removeEventListener("topnav:new-chat", newChat);
    };
  }, [newSession]);

  // Persist session summaries for sidebar
  useEffect(() => {
    if (!sessionId) return;
    if (!messages || messages.length === 0) return;

    try {
      const firstUserMsg = messages.find((m) => m.role === "user");
      const lastMsg = messages[messages.length - 1];
      const title = (firstUserMsg?.content || "New Chat").slice(0, 50) + "...";
      const lastMessage = (lastMsg?.content || "").slice(0, 100) + "...";
      const entry = {
        id: sessionId,
        title,
        lastMessage,
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
      };

      const existingRaw = localStorage.getItem("rag-chat-sessions");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const filtered = existing.filter((s: any) => s.id !== sessionId);
      const updated = [entry, ...filtered];
      localStorage.setItem("rag-chat-sessions", JSON.stringify(updated));
    } catch {}
  }, [messages, sessionId]);

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex relative">
      {showSplash && (
        <WelcomeSplash
          onComplete={() => {
            sessionStorage.setItem("splash-done", "1");
            setShowSplash(false);
          }}
        />
      )}
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        setOpen={setSidebarOpen}
        sessions={sidebarSessions}
        currentSessionId={sessionId}
        onSelectSession={(id) => {
          switchToSession(id);
          setSidebarOpen(false);
        }}
        onNewSession={() => {
          newSession();
          setSidebarOpen(false);
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col min-h-screen bg-neutral-900">
        {/* Header (Navbar) */}
        <div className="px-4 pt-3">
          <TopNavbar onOpenSidebar={() => setSidebarOpen(true)} />
        </div>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col min-h-0">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={sendMessage}
          />
          <MessageInput
            onSendMessage={sendMessage}
            onStopGeneration={stopGeneration}
            onRegenerateMessage={regenerateLastMessage}
            onNewSession={newSession}
            isStreaming={isStreaming}
            disabled={false}
          />
        </main>
      </motion.div>
    </div>
  );
}

export default App;
