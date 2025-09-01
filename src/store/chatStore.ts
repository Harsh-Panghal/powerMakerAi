import { create } from 'zustand';
import { startStreamingResponse } from '@/utils/mockApi';

export interface Message {
  id: string;
  type: 'user' | 'assistant';
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

interface ChatStore {
  // UI State
  isPreviewOpen: boolean;
  previewContent: string;
  
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
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial UI State
  isPreviewOpen: false,
  previewContent: '',
  
  // Initial Chat State
  currentThread: null,
  recentThreads: [],
  selectedModel: 'model-0-1',
  
  // Actions
  startChat: (prompt: string) => {
    const threadId = `thread-${Date.now()}`;
    const messageId = `msg-${Date.now()}`;
    
    const newThread: ChatThread = {
      id: threadId,
      title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
      messages: [{
        id: messageId,
        type: 'user',
        content: prompt,
        timestamp: new Date(),
      }],
      createdAt: new Date(),
      model: get().selectedModel,
    };
    
    set({ 
      currentThread: newThread 
    });
    
    // Trigger streaming assistant response
    setTimeout(() => {
      get().addAssistantMessage('', true);
      startStreamingResponse(prompt);
    }, 500);
  },
  
  sendMessage: (message: string) => {
    const currentThread = get().currentThread;
    if (!currentThread) return;
    
    const messageId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: messageId,
      type: 'user',
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
      get().addAssistantMessage('', true);
      startStreamingResponse(message);
    }, 500);
  },
  
  newChat: () => {
    // Save current thread to recent threads if it exists
    get().saveToRecentThreads();
    
    set({ 
      currentThread: null,
      isPreviewOpen: false,
      previewContent: '',
    });
  },
  
  openPreview: (content: string) => {
    set({ 
      isPreviewOpen: true, 
      previewContent: content 
    });
  },
  
  closePreview: () => {
    set({ 
      isPreviewOpen: false, 
      previewContent: '' 
    });
  },
  
  setModel: (model: string) => {
    // Save current thread to recent threads if it exists
    get().saveToRecentThreads();
    
    set({ 
      selectedModel: model,
      currentThread: null,
      isPreviewOpen: false,
      previewContent: '',
    });
  },
  
  addAssistantMessage: (content: string, isStreaming = false) => {
    const currentThread = get().currentThread;
    if (!currentThread) return;
    
    const messageId = `msg-${Date.now()}`;
    const assistantMessage: Message = {
      id: messageId,
      type: 'assistant',
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
    
    if (lastMessage && lastMessage.type === 'assistant' && lastMessage.isStreaming) {
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
    
    if (lastMessage && lastMessage.type === 'assistant' && lastMessage.isStreaming) {
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
      const existingIndex = recentThreads.findIndex(thread => thread.id === currentThread.id);
      
      let updatedRecentThreads;
      if (existingIndex >= 0) {
        // Update existing thread
        updatedRecentThreads = [...recentThreads];
        updatedRecentThreads[existingIndex] = currentThread;
      } else {
        // Add new thread to the beginning
        updatedRecentThreads = [currentThread, ...recentThreads.slice(0, 9)]; // Keep last 10
      }
      
      set({ recentThreads: updatedRecentThreads });
    }
  },
  
  loadThread: (threadId: string) => {
    const recentThreads = get().recentThreads;
    const threadToLoad = recentThreads.find(thread => thread.id === threadId);
    
    if (threadToLoad) {
      set({ 
        currentThread: threadToLoad 
      });
    }
  },
}));