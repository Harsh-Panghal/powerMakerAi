import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Key, Settings } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useNavigate } from 'react-router-dom';

const modelOptions = [
  { 
    value: "model-0-1", 
    title: "Model 0.1", 
    subtitle: "CRM Customization",
    icon: Settings
  },
  { 
    value: "model-0-2", 
    title: "Model 0.2", 
    subtitle: "Plugin Tracing",
    icon: Database
  },
  { 
    value: "model-0-3", 
    title: "Model 0.3", 
    subtitle: "CRM Expert",
    icon: Key
  }
];

export function ChatInput() {
  const [message, setMessage] = useState('');
  const { selectedModel, setModel, sendMessage } = useChatStore();
  const navigate = useNavigate();
  const maxLength = 1000;

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    navigate('/');
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-2 sm:p-4 bg-layout-main border-t border-border">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="relative">
          {/* Textarea */}
          <Textarea
            placeholder="Enter Prompt Here"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] sm:min-h-[100px] pr-4 sm:pr-36 pb-12 sm:pb-14 resize-none border-brand-light focus:ring-brand-light text-sm sm:text-base"
          />

          {/* Bottom Controls - Model Selector, Character Counter & Send Button */}
          <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 flex items-center space-x-2 sm:space-x-3">
            {/* Model Selector */}
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-24 sm:w-32 h-6 sm:h-7 text-xs border-border focus:ring-0 focus:ring-offset-0">
                <SelectValue>
                  <span className="truncate">
                    {modelOptions.find(option => option.value === selectedModel)?.title || "Model 0.1"}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="focus:ring-0 z-50">
                {modelOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value} className="text-xs focus:bg-muted focus:text-foreground">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">{option.title}</span>
                          <span className="text-muted-foreground text-xs truncate">{option.subtitle}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Character Counter */}
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {message.length}/{maxLength}
            </span>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              size="sm"
              className="w-7 h-7 sm:w-8 sm:h-8 p-0 rounded-full bg-success-light hover:bg-success text-success-dark flex-shrink-0"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}