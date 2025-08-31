import { useChatStore } from '@/store/chatStore';
import { startStreamingResponse } from './mockApi';

// Hook up streaming to the store
export const initializeStreaming = () => {
  // This will be called when the app starts to connect streaming to the store
  console.log('Streaming initialized');
};

// Trigger streaming response
export const handleStreamingResponse = (prompt: string) => {
  startStreamingResponse(prompt);
};