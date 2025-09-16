import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`,
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error);
    if (error.response?.status === 404) {
      throw new Error("API endpoint not found");
    } else if (error.response?.status >= 500) {
      throw new Error("Server error occurred");
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout");
    } else if (error.code === "ERR_NETWORK") {
      throw new Error("Network connection failed");
    }
    throw error;
  },
);

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: ChatMessage;
  sessionId: string;
}

export const chatApi = {
  sendMessage: async (
    sessionId: string,
    message: string,
  ): Promise<ChatResponse> => {
    try {
      const response = await api.post("/chat", {
        sessionId,
        message,
      });
      return response.data;
    } catch (error) {
      // Fallback for demo purposes
      console.warn("API call failed, using mock response:", error);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        message: {
          id: Math.random().toString(36).substr(2, 9),
          role: "assistant",
          content: `I received your message: "${message}"\n\nThis is a demo response since the backend API is not connected. The chatbot would normally process your query through a RAG system to provide news-related information.\n\n**Features this interface supports:**\n- Real-time streaming responses\n- Markdown formatting with code blocks\n- Session management\n- Dark/light theme switching\n- Responsive design`,
          timestamp: new Date(),
        },
        sessionId,
      };
    }
  },

  getHistory: async (
    sessionId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ChatMessage[]> => {
    try {
      const response = await api.get(`/chat/history/${sessionId}`, {
        params: { limit, offset },
      });
      const messages = response.data?.messages || [];
      return messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));
    } catch (error) {
      console.warn("Failed to fetch history:", error);
      return [];
    }
  },

  createSSEConnection: (
    sessionId: string,
    message: string,
    onMessage: (content: string) => void,
    onComplete: () => void,
  ): EventSource | null => {
    try {
      const eventSource = new EventSource(
        `${API_BASE_URL}/chat/stream?sessionId=${sessionId}&message=${encodeURIComponent(
          message,
        )}`,
      );

      eventSource.addEventListener("chunk", (event) => {
        const data = JSON.parse(event.data);
        if (data.content) {
          onMessage(data.content);
        }
      });

      eventSource.addEventListener("complete", (event) => {
        const data = JSON.parse(event.data);
        if (data.done) {
          eventSource.close();
          onComplete();
        }
      });

      eventSource.addEventListener("error", (event) => {
        console.error("SSE error event:", event);
        eventSource.close();
        // Fallback to regular API call
        chatApi.sendMessage(sessionId, message).then((response) => {
          onMessage(response.message.content);
          onComplete();
        });
      });

      eventSource.onerror = () => {
        console.error("SSE connection failed");
        eventSource.close();
        // Fallback to regular API call
        chatApi.sendMessage(sessionId, message).then((response) => {
          onMessage(response.message.content);
          onComplete();
        });
      };

      return eventSource;
    } catch (error) {
      console.error("Failed to create SSE connection:", error);
      return null;
    }
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    try {
      await api.delete(`/session/${sessionId}`);
    } catch (error) {
      console.warn("Failed to delete session on server:", error);
      // Continue anyway for local cleanup
    }
  },
};

export default api;
