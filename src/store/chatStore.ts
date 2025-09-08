import { create } from "zustand";
import { startStreamingResponse } from "@/utils/mockApi";

export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  model: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  startDate: string;
  endDate: string;
  plugin: string;
  stage: string;
}

export interface Connection {
  id: string;
  name: string;
  isSelected: boolean;
}

interface ChatStore {
  // UI State
  isPreviewOpen: boolean;
  previewContent: string;

  // Notification State
  notifications: Notification[];
  isNotificationOpen: boolean;
  highlightedNotificationId: string | null;
  activeConnections: { name: string } | null;
  
  // Connection State
  activeConnection: Connection | null;

  // Chat State
  currentThread: ChatThread | null;
  recentThreads: ChatThread[];
  selectedModel: string;

  // Actions
  startChat: (prompt: string) => void;
  sendMessage: (message: string) => void;
  newChat: () => void;
  openPreview: (content: string) => void;
  closePreview: () => void;
  setModel: (model: string) => void;
  addAssistantMessage: (content: string, isStreaming?: boolean) => void;
  updateStreamingMessage: (content: string) => void;
  finishStreaming: () => void;
  saveToRecentThreads: () => void;
  loadThread: (threadId: string) => void;
  renameThread: (threadId: string, newTitle: string) => void;
  deleteThread: (threadId: string) => void;

  // Notification Actions
  addNotification: (notification: Omit<Notification, "id">) => string;
  openNotifications: () => void;
  closeNotifications: () => void;
  setHighlightedNotification: (id: string | null) => void;
  highlightNotification: (id: string) => void;

  // Connection Actions
  setActiveConnection: (connection: Connection) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial UI State
  isPreviewOpen: false,
  previewContent: "",

  // Initial Notification State
  notifications: [
    {
      id: '1',
      type: "trace",
      title: "Plugin Execution Trace",
      startDate: "2024-01-15 10:30",
      endDate: "2024-01-15 10:35",
      plugin: "ContactValidation",
      stage: "PreOperation",
    },
    {
      id: '2',
      type: "activity",
      title: "Entity Created Successfully",
      startDate: "2024-01-15 09:45",
      endDate: "2024-01-15 09:46",
      plugin: "EntityCreation",
      stage: "PostOperation",
    },
    {
      id: '3',
      type: "update",
      title: "Configuration Updated",
      startDate: "2024-01-15 08:20",
      endDate: "2024-01-15 08:21",
      plugin: "ConfigManager",
      stage: "PreValidation",
    },
  ],
  isNotificationOpen: false,
  highlightedNotificationId: null,
  activeConnections: null,
  
  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Generate unique ID
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));
    
    return newNotification.id; // Return the ID so we can highlight it
  },
  
  openNotifications: () => {
    set({ isNotificationOpen: true });
  },
  
  closeNotifications: () => {
    set({ isNotificationOpen: false });
  },
  
  setHighlightedNotification: (id: string | null) => {
    set({ highlightedNotificationId: id });
  },
  
  highlightNotification: (id: string) => {
    set({ highlightedNotificationId: id });
    // Clear highlight after 2 seconds
    setTimeout(() => {
      const currentState = get();
      if (currentState.highlightedNotificationId === id) {
        set({ highlightedNotificationId: null });
      }
    }, 2000);
  },
  // Initial Connection State
  activeConnection: { id: "1", name: "CRM Dev", isSelected: true },

  // Initial Chat State
  currentThread: null,
  recentThreads: [],
  selectedModel: "model-0-1",

  // Actions
  startChat: (prompt: string) => {
    const threadId = `thread-${Date.now()}`;
    const messageId = `msg-${Date.now()}`;

    const newThread: ChatThread = {
      id: threadId,
      title: prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt,
      messages: [
        {
          id: messageId,
          type: "user",
          content: prompt,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      model: get().selectedModel,
    };

    set({
      currentThread: newThread,
    });

    // Trigger streaming assistant response
    setTimeout(() => {
      get().addAssistantMessage("", true);
      startStreamingResponse(prompt);
    }, 500);
  },

  sendMessage: (message: string) => {
    const currentThread = get().currentThread;
    if (!currentThread) return;

    const messageId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: messageId,
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    const updatedThread = {
      ...currentThread,
      messages: [...currentThread.messages, userMessage],
    };

    set({ currentThread: updatedThread });

    // Trigger streaming assistant response
    setTimeout(() => {
      get().addAssistantMessage("", true);
      startStreamingResponse(message);
    }, 500);
  },

  newChat: () => {
    // Save current thread to recent threads if it exists
    get().saveToRecentThreads();

    set({
      currentThread: null,
      isPreviewOpen: false,
      previewContent: "",
    });
  },

  openPreview: (content: string) => {
    set({
      isPreviewOpen: true,
      previewContent: content,
    });
  },

  closePreview: () => {
    set({
      isPreviewOpen: false,
      previewContent: "",
    });
  },

  setModel: (model: string) => {
    // Save current thread to recent threads if it exists
    get().saveToRecentThreads();

    set({
      selectedModel: model,
      currentThread: null,
      isPreviewOpen: false,
      previewContent: "",
    });
  },

  addAssistantMessage: (content: string, isStreaming = false) => {
    const currentThread = get().currentThread;
    if (!currentThread) return;

    const messageId = `msg-${Date.now()}`;
    const assistantMessage: Message = {
      id: messageId,
      type: "assistant",
      content,
      timestamp: new Date(),
      isStreaming,
    };

    const updatedThread = {
      ...currentThread,
      messages: [...currentThread.messages, assistantMessage],
    };

    set({ currentThread: updatedThread });
  },

  updateStreamingMessage: (content: string) => {
    const currentThread = get().currentThread;
    if (!currentThread) return;

    const messages = [...currentThread.messages];
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage &&
      lastMessage.type === "assistant" &&
      lastMessage.isStreaming
    ) {
      lastMessage.content = content;

      const updatedThread = {
        ...currentThread,
        messages,
      };

      set({ currentThread: updatedThread });
    }
  },

  finishStreaming: () => {
    const currentThread = get().currentThread;
    if (!currentThread) return;

    const messages = [...currentThread.messages];
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage &&
      lastMessage.type === "assistant" &&
      lastMessage.isStreaming
    ) {
      lastMessage.isStreaming = false;

      const updatedThread = {
        ...currentThread,
        messages,
      };

      set({ currentThread: updatedThread });

      // Auto-save to recent threads when response is complete
      get().saveToRecentThreads();
    }
  },

  saveToRecentThreads: () => {
    const currentThread = get().currentThread;

    // Only save if thread exists and has messages
    if (currentThread && currentThread.messages.length > 0) {
      const recentThreads = get().recentThreads;

      // Check if this thread is already in recent threads
      const existingIndex = recentThreads.findIndex(
        (thread) => thread.id === currentThread.id
      );

      let updatedRecentThreads;
      if (existingIndex >= 0) {
        // Update existing thread
        updatedRecentThreads = [...recentThreads];
        updatedRecentThreads[existingIndex] = currentThread;
      } else {
        // Add new thread to the beginning
        updatedRecentThreads = [currentThread, ...recentThreads.slice(0, 16)]; // Keep last 17 threads
      }

      set({ recentThreads: updatedRecentThreads });
    }
  },

  loadThread: (threadId: string) => {
    const recentThreads = get().recentThreads;
    const threadToLoad = recentThreads.find((thread) => thread.id === threadId);

    if (threadToLoad) {
      set({
        currentThread: threadToLoad,
      });
    }
  },

  renameThread: (threadId: string, newTitle: string) => {
    const currentThread = get().currentThread;
    const recentThreads = get().recentThreads;

    // Update current thread if it matches
    if (currentThread && currentThread.id === threadId) {
      set({
        currentThread: { ...currentThread, title: newTitle },
      });
    }

    // Update in recent threads
    const updatedRecentThreads = recentThreads.map((thread) =>
      thread.id === threadId ? { ...thread, title: newTitle } : thread
    );

    set({ recentThreads: updatedRecentThreads });
  },

  deleteThread: (threadId: string) => {
    const currentThread = get().currentThread;
    const recentThreads = get().recentThreads;

    // If current thread is being deleted, clear it
    if (currentThread && currentThread.id === threadId) {
      set({ currentThread: null });
    }

    // Remove from recent threads
    const updatedRecentThreads = recentThreads.filter(
      (thread) => thread.id !== threadId
    );
    set({ recentThreads: updatedRecentThreads });
  },
  // Connection Actions
  setActiveConnection: (connection: Connection) => {
    set({ activeConnection: connection });
  },
}));
