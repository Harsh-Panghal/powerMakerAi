import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { GreetingContainer } from './GreetingContainer';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { PreviewDrawer } from './PreviewDrawer';

export function ChatArea() {
  const { showGreeting, currentThread } = useChatStore();

  return (
    <div className="flex-1 flex flex-col bg-layout-main relative min-h-0">
      <AnimatePresence mode="wait">
        {showGreeting ? (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-auto"
          >
            <GreetingContainer />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Fixed Chat Header */}
            <div className="flex-shrink-0 p-4 border-b border-border bg-layout-main">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-lg font-semibold text-brand">
                  {currentThread?.title || 'New Conversation'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Model: {currentThread?.model === 'model-0-1' ? 'Model 0.1 - CRM Customization' : 
                           currentThread?.model === 'model-0-2' ? 'Model 0.2 - Plugin Tracing' :
                           'Model 0.3 - CRM Expert'}
                </p>
              </div>
            </div>
            
            {/* Scrollable Messages Area */}
            <div className="flex-1 min-h-0">
              <MessageList />
            </div>
            
            {/* Fixed Chat Input */}
            <div className="flex-shrink-0 border-t border-border bg-layout-main">
              <ChatInput />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Preview Drawer */}
      <PreviewDrawer />
    </div>
  );
}