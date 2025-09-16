import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { chatApi, ChatMessage } from "../services/api";

export interface UseChatReturn {
  messages: ChatMessage[];
  sessionId: string;
  isStreaming: boolean;
  sendMessage: (message: string) => Promise<void>;
  stopGeneration: () => void;
  regenerateLastMessage: () => Promise<void>;
  newSession: () => void;
  switchToSession: (sessionId: string) => void;
  isConnected: boolean;
}

const SESSION_STORAGE_KEY = "rag-chat-session-id";
const MESSAGES_STORAGE_KEY = "rag-chat-messages";

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const sseRef = useRef<EventSource | null>(null);
  const lastUserMessageRef = useRef<string>("");

  // Initialize session and load messages from localStorage
  useEffect(() => {
    // Optional URL override: ?session=... or ?sessionId=...
    const params = new URLSearchParams(window.location.search);
    const urlSession = params.get("session") || params.get("sessionId");

    let storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (urlSession && urlSession !== storedSessionId) {
      // Use URL-provided session and clear local messages to avoid mixing
      storedSessionId = urlSession;
      localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId);
      localStorage.removeItem(MESSAGES_STORAGE_KEY);
      setMessages([]);
    }

    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId);
    }
    setSessionId(storedSessionId);

    // Load stored messages
    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Failed to parse stored messages:", error);
        localStorage.removeItem(MESSAGES_STORAGE_KEY);
      }
    }
  }, []);

  // Fetch server history when sessionId is known
  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) return;
      try {
        const serverMessages = await chatApi.getHistory(sessionId, 100, 0);
        if (Array.isArray(serverMessages) && serverMessages.length > 0) {
          // Deduplicate by id, prefer latest from server
          setMessages((prev) => {
            const byId = new Map<string, ChatMessage>();
            [...prev, ...serverMessages].forEach((m) => byId.set(m.id, m));
            return Array.from(byId.values());
          });
        }
      } catch (e) {
        console.warn("History fetch failed:", e);
      }
    };
    fetchHistory();
  }, [sessionId]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content,
        };
      }
      return updated;
    });
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (isStreaming || !message.trim()) return;

      lastUserMessageRef.current = message;
      setIsConnected(true);

      // Add user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      addMessage(userMessage);

      // Add empty assistant message for streaming
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      addMessage(assistantMessage);

      setIsStreaming(true);

      try {
        // Try SSE first
        const eventSource = chatApi.createSSEConnection(
          sessionId,
          message,
          (content: string) => {
            updateLastMessage(content);
          },
          () => {
            setIsStreaming(false);
          },
        );

        if (eventSource) {
          sseRef.current = eventSource;
        } else {
          // Fallback to regular API call
          const response = await chatApi.sendMessage(sessionId, message);
          updateLastMessage(response.message.content);
          setIsStreaming(false);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        setIsConnected(false);
        updateLastMessage(
          "Sorry, I encountered an error processing your message. Please try again.",
        );
        setIsStreaming(false);
      }
    },
    [sessionId, isStreaming, addMessage, updateLastMessage],
  );

  const stopGeneration = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const regenerateLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current || isStreaming) return;

    // Remove last assistant message if it exists
    setMessages((prev) => {
      const updated = [...prev];
      if (
        updated.length > 0 &&
        updated[updated.length - 1].role === "assistant"
      ) {
        updated.pop();
      }
      return updated;
    });

    // Resend the last user message
    await sendMessage(lastUserMessageRef.current);
  }, [sendMessage, isStreaming]);

  const newSession = useCallback(() => {
    // Stop any ongoing streaming
    stopGeneration();

    // Clear messages
    setMessages([]);
    localStorage.removeItem(MESSAGES_STORAGE_KEY);

    // Generate new session ID
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);

    // Optionally delete old session on server
    chatApi.deleteSession(sessionId).catch(console.error);

    lastUserMessageRef.current = "";
  }, [sessionId, stopGeneration]);

  const switchToSession = useCallback(
    (newSessionId: string) => {
      // Stop any ongoing streaming
      stopGeneration();

      // Save current session messages before switching
      if (messages.length > 0) {
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
      }

      // Switch to new session
      setSessionId(newSessionId);
      localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);

      // Clear current messages - they'll be loaded by the fetch history effect
      setMessages([]);
      localStorage.removeItem(MESSAGES_STORAGE_KEY);

      lastUserMessageRef.current = "";
    },
    [messages, stopGeneration],
  );

  return {
    messages,
    sessionId,
    isStreaming,
    sendMessage,
    stopGeneration,
    regenerateLastMessage,
    newSession,
    switchToSession,
    isConnected,
  };
}
