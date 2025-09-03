import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Sparkles, Plus, FileCode, Code, HelpCircle, Table2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FollowUpPromptCard } from './FollowUpPromptCard';
import { Message, useChatStore } from '@/store/chatStore';
import { TablesView } from './TablesView';
import { TraceLogFilters } from './TraceLogFilters';
import { PluginTraceLogs } from './PluginTraceLogs';

interface AssistantActionsProps {
  message: Message;
}

const quickPrompts = [
  {
    text: "Create a new entity named 'API Configuration' with ownership type 'Organization' and a primary attribute called 'API Name' of type Text",
    icon: Sparkles,
  },
  {
    text: "Add an attribute called 'API Endpoint URL' of type Text",
    icon: Plus,
  },
  {
    text: "Add an attribute called 'Authentication Type' of type Picklist with options 'API Key' 'OAuth 2.0' 'Basic Authentication' and 'None'",
    icon: FileCode,
  },
  {
    text: "Add an attribute called 'Is Active' of type Boolean",
    icon: Code,
  },
  {
    text: "Generate schema JSON for the complete API Configuration entity",
    icon: HelpCircle,
  },
];

export function AssistantActions({ message }: AssistantActionsProps) {
  const { openPreview, sendMessage, selectedModel } = useChatStore();
  const [showTables, setShowTables] = useState(false);
  const [showTraceLogFilters, setShowTraceLogFilters] = useState(false);
  const [showPluginTraceLogs, setShowPluginTraceLogs] = useState(false);

  const handlePreview = () => {
    openPreview(message.content);
  };

  const handleQuickPrompt = (promptText: string) => {
    sendMessage(promptText);
  };

  const handleShowTraceLogs = () => {
    setShowTraceLogFilters(false);
    setShowPluginTraceLogs(true);
  };

  const handleBackToFilters = () => {
    setShowPluginTraceLogs(false);
    setShowTraceLogFilters(true);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handlePreview}
              variant="outline"
              size="sm"
              className="bg-background hover:bg-muted border-border text-foreground"
            >
              <Eye className="w-4 h-4 mr-2" />
              Show Preview
            </Button>
          </motion.div>
          
          {selectedModel === 'model-0-1' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => setShowTables(true)}
                variant="outline"
                size="sm"
                className="bg-background hover:bg-muted border-border text-foreground"
              >
                <Table2 className="w-4 h-4 mr-2" />
                Show Tables
              </Button>
            </motion.div>
          )}
          
          {selectedModel === 'model-0-2' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => setShowTraceLogFilters(true)}
                variant="outline"
                size="sm"
                className="bg-background hover:bg-muted border-border text-foreground"
              >
                <Filter className="w-4 h-4 mr-2" />
                Show Trace Logs
              </Button>
            </motion.div>
          )}
        </div>

        {/* Quick Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Prompts</h4>
          <div className="grid gap-2">
            {quickPrompts.map((prompt, index) => {
              const IconComponent = prompt.icon;
              return (
                <motion.div
                  key={prompt.text}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="w-full"
                >
                  <FollowUpPromptCard
                    title={prompt.text}
                    icon={IconComponent}
                    onClick={() => handleQuickPrompt(prompt.text)}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
      
      {/* Conditional Modals */}
      {selectedModel === 'model-0-1' && (
        <TablesView 
          isOpen={showTables} 
          onClose={() => setShowTables(false)} 
        />
      )}
      
      {selectedModel === 'model-0-2' && (
        <>
          <TraceLogFilters
            isOpen={showTraceLogFilters}
            onClose={() => setShowTraceLogFilters(false)}
            onShowTraceLogs={handleShowTraceLogs}
          />
          <PluginTraceLogs
            isOpen={showPluginTraceLogs}
            onClose={() => setShowPluginTraceLogs(false)}
            onBack={handleBackToFilters}
          />
        </>
      )}
    </>
  );
}