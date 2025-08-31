import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Key, Settings } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

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
  const maxLength = 1000;

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
    <div className="p-6 bg-layout-main">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Textarea */}
          <Textarea
            placeholder="Enter Prompt Here"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] pr-36 pb-14 resize-none border-brand-light focus:ring-brand-light"
          />
          
          {/* Top Right Controls - Model Selector */}
          <div className="absolute right-3 top-3">
            <Select value={selectedModel} onValueChange={setModel}>
              <SelectTrigger className="w-40 h-8 text-xs border-border focus:ring-0 focus:ring-offset-0">
                <SelectValue>
                  {modelOptions.find(option => option.value === selectedModel)?.title || "Model 0.1"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="focus:ring-0">
                {modelOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value} className="text-xs focus:bg-muted focus:text-foreground">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium">{option.title}</span>
                          <span className="text-muted-foreground text-xs">{option.subtitle}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Bottom Right Controls - Character Counter & Send Button */}
          <div className="absolute right-3 bottom-3 flex items-center space-x-3">
            {/* Character Counter */}
            <span className="text-xs text-muted-foreground">
              {message.length}/{maxLength}
            </span>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              size="sm"
              className="w-8 h-8 p-0 rounded-full bg-success-light hover:bg-success text-success-dark"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}