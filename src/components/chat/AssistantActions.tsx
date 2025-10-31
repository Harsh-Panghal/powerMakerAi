import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, Table2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingProgressBar } from "@/components/ui/loading-progress-bar";
import { FollowUpPromptCard } from "./FollowUpPromptCard";
import { TablesView } from "./TablesView";
import { TraceLogFilters } from "./TraceLogFilters";
import { PluginTraceLogs } from "./PluginTraceLogs";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import {
  openPreview,
  setShowTables,
  updatePreviewClickedMap,
  setCustomizationVisible,
} from "@/redux/ChatSlice";
import {
  setApiTraceLogs,
  setIsLoadingTraceLogs,
  setTraceData,
} from "@/redux/CrmSlice";
import { useChat } from "@/redux/useChat";

interface AssistantActionsProps {
  message: {
    id: string;
    content: string;
    type: "user" | "assistant";
    timestamp: Date;
    isStreaming?: boolean;
    images?: Array<{ data: string; name: string; size: number; type: string }>;
  };
  items: string[];
}

export function AssistantActions({ message, items }: AssistantActionsProps) {
  const dispatch = useDispatch();

  // Dialog open/close states
  const [showTraceLogFilters, setShowTraceLogFilters] = useState(false);
  const [showPluginTraceLogs, setShowPluginTraceLogs] = useState(false);

  // Loading states
  const [isLoadingTraceFilters, setIsLoadingTraceFilters] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // UI state
  const [hasOpenedTables, setHasOpenedTables] = useState(false);
  const [traceFiltersData, setTraceFiltersData] = useState<any>(null);

  // Track if we're waiting for trace data
  const waitingForTraceDataRef = useRef(false);

  const { currentModel } = useSelector((state: RootState) => state.model);

  const { chatId, recentPrompt, previewClickedMap, showTables, loading } =
    useSelector((state: RootState) => state.chat);
  const { crmActionData, traceData, apiTraceLogs, isLoadingTraceLogs } =
    useSelector((state: RootState) => state.crm);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { onSent } = useChat();

  // Check if preview was already clicked for this prompt
  useEffect(() => {
    if (recentPrompt && !(recentPrompt in previewClickedMap)) {
      dispatch(
        updatePreviewClickedMap({ prompt: recentPrompt, clicked: false })
      );
    }
  }, [recentPrompt, previewClickedMap, dispatch]);

  // Show customization button logic
  useEffect(() => {
    if (
      crmActionData !== "" &&
      recentPrompt &&
      !previewClickedMap[recentPrompt]
    ) {
      dispatch(
        updatePreviewClickedMap({ prompt: recentPrompt, clicked: true })
      );
    }

    dispatch(
      setCustomizationVisible(
        previewClickedMap[recentPrompt] && crmActionData !== ""
      )
    );
  }, [crmActionData, recentPrompt, previewClickedMap, dispatch]);

  //Handle trace data changes - open dialog when data arrives
  useEffect(() => {
    // console.log("=== TraceData useEffect triggered ===");
    // console.log(
    //   "waitingForTraceDataRef.current:",
    //   waitingForTraceDataRef.current
    // );
    // console.log("traceData:", traceData);
    // console.log("traceData type:", typeof traceData);
    // console.log("loading:", loading);
    // console.log("isLoadingTraceFilters:", isLoadingTraceFilters);

    // Only proceed if we're waiting for trace data AND not currently loading
    if (!isLoadingTraceFilters || loading) {
      // console.log(
      //   "❌ Not loading trace filters or still loading chat, skipping"
      // );
      return;
    }

    // Check if we have valid trace data
    if (traceData && traceData !== "") {
      // console.log("✅ Valid trace data received, attempting to open dialog");

      try {
        // Handle both string and object formats
        let parsedData;
        if (typeof traceData === "string") {
          parsedData = JSON.parse(traceData);
        } else {
          parsedData = traceData;
        }

        // console.log("Parsed trace data:", parsedData);

        // Check if it's valid data (has pluginfilter property)
        if (
          parsedData &&
          (parsedData.pluginfilter || parsedData.pluginFilter)
        ) {
          setTraceFiltersData(parsedData);
          setShowTraceLogFilters(true);
          setIsLoadingTraceFilters(false);
          waitingForTraceDataRef.current = false;
          // console.log("✅ Dialog opened successfully");
        } else {
          // console.warn("⚠️ Invalid trace data format:", parsedData);
          setIsLoadingTraceFilters(false);
          waitingForTraceDataRef.current = false;
          alert("Received invalid trace filter data. Please try again.");
        }
      } catch (error) {
        // console.error("❌ Error processing trace data:", error);
        setIsLoadingTraceFilters(false);
        waitingForTraceDataRef.current = false;
        alert("Failed to parse trace filters. Please try again.");
      }
    }
  }, [traceData, loading, isLoadingTraceFilters]);

  // Open preview
  const handlePreview = () => {
    dispatch(openPreview(message.content));
  };

  // Handle quick prompt
  const handleQuickPrompt = (promptText: string) => {
    if (chatId) {
      onSent(promptText, chatId ?? "", 0, currentModel);
    }
  };

  //Handle showing trace filters (Start Analysis button clicked)
  const handleShowTraceFilters = async () => {
    if (!isAuthenticated) {
      alert("You must sign in to access Developer Mode.");
      return;
    }

    // console.log("🔵 Start Analysis clicked");
    // console.log("🔵 Current traceData:", traceData);
    // console.log("🔵 traceData type:", typeof traceData);

    //Check if we already have valid trace data
    if (traceData && traceData !== "") {
      // console.log("✅ Trace data already exists in Redux, using it directly");

      try {
        let parsedData;
        if (typeof traceData === "string") {
          // console.log("🔵 Parsing string trace data");
          parsedData = JSON.parse(traceData);
        } else {
          // console.log("🔵 Using object trace data directly");
          parsedData = traceData;
        }

        // console.log("🔵 Parsed data:", parsedData);

        // Validate the data structure
        if (
          parsedData &&
          (parsedData.pluginfilter || parsedData.pluginFilter)
        ) {
          // console.log("✅ Valid trace data found, opening dialog immediately");
          setTraceFiltersData(parsedData);
          setShowTraceLogFilters(true);
          return; // Exit early - no need to fetch new data
        } else {
          console.warn(
            "⚠️ Trace data exists but has invalid structure:",
            parsedData
          );
        }
      } catch (error) {
        console.error("❌ Error parsing existing trace data:", error);
        // Fall through to fetch new data
      }
    }

    // If we reach here, we need to fetch fresh data
    // console.log("🔵 No valid trace data found, fetching from API...");

    // Set loading state and waiting flag
    setIsLoadingTraceFilters(true);
    waitingForTraceDataRef.current = true;

    // console.log("🔵 Set waitingForTraceDataRef to true");
    // console.log("🔵 Set loading state to true");

    // Send the predefined prompt to extract filter details
    const predefinedPrompt = "extract all the collected plugin filter details";

    try {
      // console.log("🔵 Sending trace filter extraction prompt");
      await onSent(predefinedPrompt, chatId ?? "", 1, 1);
      // console.log(
      //   "🔵 Prompt sent successfully, waiting for response via useEffect"
      // );
      // Don't set loading to false here - the useEffect will handle it when data arrives
    } catch (error) {
      console.error("❌ Error sending trace filter prompt:", error);
      setIsLoadingTraceFilters(false);
      waitingForTraceDataRef.current = false;
      alert("Failed to load trace filters. Please try again.");
    }
  };

  // Handle showing trace logs (from filters modal)
  const handleShowTraceLogs = async (updatedFilters: any) => {
    if (!isAuthenticated) {
      alert("You must sign in to access Developer Mode.");
      return;
    }

    dispatch(setIsLoadingTraceLogs(true));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/users/api/plugintrace`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFilters),
        }
      );

      const result = await response.json();

      if (Array.isArray(result)) {
        console.log("Trace logs received:", result.length, "records");
        dispatch(setApiTraceLogs(result));
        setShowTraceLogFilters(false);
        setShowPluginTraceLogs(true);
      } else {
        console.error("Unexpected API result format:", result);
        alert("Failed to fetch trace logs. Please try again.");
      }
    } catch (error) {
      console.error("Error during tracing API call:", error);
      alert("Error fetching trace logs. Please try again.");
    } finally {
      dispatch(setIsLoadingTraceLogs(false));
    }
  };

  const handleBackToFilters = () => {
    setShowPluginTraceLogs(false);
    setShowTraceLogFilters(true);
  };

  // Open tables view logic
  const handleShowTables = async () => {
    const predefinedPrompt =
      "No, Proceed with the customisation with the given details";
    onSent(predefinedPrompt, chatId ?? "", 1, 0);
    dispatch(
      updatePreviewClickedMap({ prompt: predefinedPrompt, clicked: true })
    );
    setIsLoadingTables(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setHasOpenedTables(true);
    dispatch(setShowTables(true));
    setIsLoadingTables(false);
  };

  const handleCloseTables = () => {
    dispatch(setShowTables(false));
  };

  const handleCloseTraceFilters = () => {
    setShowTraceLogFilters(false);
    setIsLoadingTraceFilters(false);
    waitingForTraceDataRef.current = false;
  };

  const handleCloseTraceLogs = () => {
    setShowPluginTraceLogs(false);
  };

  // Don't show preview button and quick prompts if tables were ever opened
  const shouldShowContent = !showTables && !hasOpenedTables;
  const shouldShowPreviewButton =
    !previewClickedMap[recentPrompt] && shouldShowContent;

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
                  {isLoadingTables ? "Loading..." : "Show Tables"}
                </Button>
              </motion.div>
            )}

            {currentModel === 1 &&
              !showTraceLogFilters &&
              !showPluginTraceLogs && (
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
                    className={`${
                      traceData && traceData !== ""
                        ? "bg-green-50 hover:bg-green-100 border-green-300 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-700 dark:text-green-300"
                        : "bg-background hover:bg-muted border-border text-foreground"
                    }`}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {isLoadingTraceFilters
                      ? "Loading..."
                      : traceData && traceData !== ""
                      ? "View Analysis ✓"
                      : "Start Analysis"}
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
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Quick Prompts
            </h4>
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
            onClose={handleCloseTraceFilters}
            onShowTraceLogs={handleShowTraceLogs}
            isLoadingTraceLogs={isLoadingTraceLogs}
            initialFilters={traceFiltersData}
          />

          <PluginTraceLogs
            isOpen={showPluginTraceLogs}
            onClose={handleCloseTraceLogs}
            onBack={handleBackToFilters}
            traceLogsData={apiTraceLogs}
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
