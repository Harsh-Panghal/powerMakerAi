import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Table2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingProgressBar } from '@/components/ui/loading-progress-bar';
import { FollowUpPromptCard } from './FollowUpPromptCard';
import { TablesView } from './TablesView';
import { TraceLogFilters } from './TraceLogFilters';
import { PluginTraceLogs } from './PluginTraceLogs';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  openPreview, 
  setShowTables,
  updatePreviewClickedMap,
  setCustomizationVisible 
} from '@/redux/ChatSlice';
import { useChat } from '@/redux/useChat';

interface AssistantActionsProps {
  message: {
    id: string;
    content: string;
    type: 'user' | 'assistant';
    timestamp: Date;
    isStreaming?: boolean;
    images?: Array<{ data: string; name: string; size: number; type: string }>;
  };
  items: string[];
}

export function AssistantActions({ message, items }: AssistantActionsProps) {
  const dispatch = useDispatch();
  const [showTraceLogFilters, setShowTraceLogFilters] = useState(false);
  const [showPluginTraceLogs, setShowPluginTraceLogs] = useState(false);
  const [isLoadingTraceFilters, setIsLoadingTraceFilters] = useState(false);
  const [isLoadingTraceLogs, setIsLoadingTraceLogs] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [hasOpenedTables, setHasOpenedTables] = useState(false);

  const { currentModel } = useSelector((state: RootState) => state.model);
  const { chatId, recentPrompt, previewClickedMap, showTables } = useSelector((state: RootState) => state.chat);
  const { crmActionData } = useSelector((state: RootState) => state.crm);
  const { onSent } = useChat();

  // Check if preview was already clicked for this prompt
  useEffect(() => {
    if (recentPrompt && !(recentPrompt in previewClickedMap)) {
      dispatch(updatePreviewClickedMap({ prompt: recentPrompt, clicked: false }));
    }
  }, [recentPrompt, previewClickedMap, dispatch]);

  // Show customization button logic
  useEffect(() => {
    if (
      crmActionData !== "" &&
      recentPrompt &&
      !previewClickedMap[recentPrompt]
    ) {
      dispatch(updatePreviewClickedMap({ prompt: recentPrompt, clicked: true }));
    }

    dispatch(setCustomizationVisible(
      previewClickedMap[recentPrompt] && crmActionData !== ""
    ));
  }, [crmActionData, recentPrompt, previewClickedMap, dispatch]);

  const handlePreview = () => {
    dispatch(openPreview(message.content));
  };

  const handleQuickPrompt = (promptText: string) => {
    if (chatId) {
      onSent(promptText, chatId ?? "", 0, currentModel);
    }
  };

  const handleShowTraceLogs = async () => {
    setIsLoadingTraceLogs(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowTraceLogFilters(false);
    setShowPluginTraceLogs(true);
    setIsLoadingTraceLogs(false);
  };

  const handleShowTraceFilters = async () => {
    setIsLoadingTraceFilters(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setShowTraceLogFilters(true);
    setIsLoadingTraceFilters(false);
  };

  const handleBackToFilters = () => {
    setShowPluginTraceLogs(false);
    setShowTraceLogFilters(true);
  };

  const handleShowTables = async () => {
    const predefinedPrompt = "No, Proceed with the customisation with the given details";
    onSent(predefinedPrompt, chatId ?? "", 1, 0);
    dispatch(updatePreviewClickedMap({ prompt: predefinedPrompt, clicked: true }));
    setIsLoadingTables(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setHasOpenedTables(true); // Mark that tables have been opened
    dispatch(setShowTables(true));
    setIsLoadingTables(false);
  };

  const handleCloseTables = () => {
    dispatch(setShowTables(false));
  };

  // Don't show preview button and quick prompts if tables were ever opened
  const shouldShowContent = !showTables && !hasOpenedTables;
  const shouldShowPreviewButton = !previewClickedMap[recentPrompt] && shouldShowContent;

  return (
    <>
      {shouldShowContent && (
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
            
            {currentModel === 0 && shouldShowPreviewButton && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleShowTables}
                  variant="outline"
                  size="sm"
                  disabled={isLoadingTables}
                  className="bg-background hover:bg-muted border-border text-foreground"
                >
                  <Table2 className="w-4 h-4 mr-2" />
                  {isLoadingTables ? 'Loading...' : 'Show Tables'}
                </Button>
              </motion.div>
            )}
            
            {currentModel === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleShowTraceFilters}
                  variant="outline"
                  size="sm"
                  disabled={isLoadingTraceFilters}
                  className="bg-background hover:bg-muted border-border text-foreground"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {isLoadingTraceFilters ? 'Loading...' : 'Show Trace Logs'}
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
              {items.map((prompt, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="w-full"
                  >
                    <FollowUpPromptCard
                      title={prompt}
                      onClick={() => handleQuickPrompt(prompt)}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Conditional Modals */}
      {currentModel === 0 && (
        <>
          <TablesView
            isOpen={showTables}
            onClose={handleCloseTables}
            isLoadingTables={isLoadingTables}
          />
          
          <LoadingProgressBar 
            isLoading={isLoadingTables}
            message="Loading CRM Entity Configuration..."
            position="overlay"
            colorScheme="primary"
          />
        </>
      )}
      
      {currentModel === 1 && (
        <>
          <TraceLogFilters
            isOpen={showTraceLogFilters}
            onClose={() => setShowTraceLogFilters(false)}
            onShowTraceLogs={handleShowTraceLogs}
            isLoadingTraceLogs={isLoadingTraceLogs}
          />
          <PluginTraceLogs
            isOpen={showPluginTraceLogs}
            onClose={() => setShowPluginTraceLogs(false)}
            onBack={handleBackToFilters}
          />
          
          <LoadingProgressBar 
            isLoading={isLoadingTraceFilters}
            message="Loading trace log filters..."
            position="overlay"
            colorScheme="primary"
          />
          
          <LoadingProgressBar 
            isLoading={isLoadingTraceLogs}
            message="Fetching plugin trace logs..."
            position="overlay"
            colorScheme="primary"
          />
        </>
      )}
    </>
  );
}