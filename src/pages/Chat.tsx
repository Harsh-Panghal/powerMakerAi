import { motion } from 'framer-motion';
import { useChatStore } from '@/store/chatStore';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { PreviewDrawer } from '@/components/chat/PreviewDrawer';

const Chat = () => {
  const { currentThread } = useChatStore();

  return (
    <div className="flex-1 flex flex-col bg-layout-main h-[82%]" data-tour="chat-area">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col h-full"
      >
        {/* Chat Header */}
        <div className="p-2 border-b border-border bg-layout-main">
          <div className="max-w-4xl px-4">
            <h2 className="text-md sm:text-md font-semibold text-brand break-words">
              {currentThread?.title || 'New Conversation'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Model: {currentThread?.model === 'model-0-1' ? 'Model 0.1 - CRM Customization' : 
                       currentThread?.model === 'model-0-2' ? 'Model 0.2 - Plugin Tracing' :
                       'Model 0.3 - CRM Expert'}
            </p>
          </div>
        </div>
        
        {/* UPDATED: Scrollable Messages Area with padding for fixed input */}
        <div className="flex-1 overflow-hidden pb-32">
          <MessageList />
        </div>
      </motion.div>
      
      {/* UPDATED: Fixed Chat Input (now handles positioning internally) */}
      <ChatInput />
      
      {/* Preview Drawer */}
      <PreviewDrawer />
    </div>
  );
};

export default Chat;