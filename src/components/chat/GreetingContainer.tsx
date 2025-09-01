import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PromptCard } from "@/components/PromptCard";
import { Database, Calendar, Key, Settings, Search, Clock, AlertTriangle, Timer, List, DollarSign, UserPlus, FileText } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

const promptSuggestionsByModel = {
  "model-0-1": [
    {
      title: "Create a custom entity to store API configuration details and suggest relevant columns.",
      icon: Database
    },
    {
      title: "Add a boolean and a date field to the opportunity entity.",
      icon: Calendar
    },
    {
      title: "I want to store 3rd party integration keys — create a config entity for that.!",
      icon: Key
    },
    {
      title: "Create a settings entity for storing SMTP details with column suggestions.",
      icon: Settings
    }
  ],
  "model-0-2": [
    {
      title: "Show all plugin trace logs for the account entity.",
      icon: Search
    },
    {
      title: "Filter trace logs generated in the last 1 hour.",
      icon: Clock
    },
    {
      title: "Find plugin logs that contain a NullReferenceException.",
      icon: AlertTriangle
    },
    {
      title: "List trace logs where execution time exceeded 60,000 ms.",
      icon: Timer
    }
  ],
  "model-0-3": [
    {
      title: "List all attributes of the Account entity..",
      icon: List
    },
    {
      title: "Show opportunities with Estimated Revenue over 1 lakh.",
      icon: DollarSign
    },
    {
      title: "Create a contact named John Doe.",
      icon: UserPlus
    },
    {
      title: "Get all cases with 'refund' in the title.",
      icon: FileText
    }
  ]
};

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

export function GreetingContainer() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();
  const { selectedModel, setModel, startChat } = useChatStore();
  const maxLength = 1000;

  const currentPromptSuggestions = useMemo(() => {
    return promptSuggestionsByModel[selectedModel as keyof typeof promptSuggestionsByModel] || promptSuggestionsByModel["model-0-1"];
  }, [selectedModel]);

  const handlePromptCardClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleSend = () => {
    if (prompt.trim()) {
      startChat(prompt.trim());
      setPrompt("");
      navigate('/chat');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Greeting Container */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold text-brand">
              Hello, Harsh!
            </h1>
            <h2 className="text-2xl text-brand">
              What would you like to make?
            </h2>
            <p className="text-muted-foreground">
              Use one of the most common prompts below
            </p>
          </div>

          {/* Prompt Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-300">
            {currentPromptSuggestions.map((suggestion, index) => (
              <PromptCard
                key={`${selectedModel}-${index}`}
                title={suggestion.title}
                icon={suggestion.icon}
                onClick={() => handlePromptCardClick(suggestion.title)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-layout-main">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Textarea */}
            <Textarea
              placeholder="Enter Prompt Here"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, maxLength))}
              onKeyDown={handleKeyDown}
              className="min-h-[100px] pr-36 pb-14 resize-none border-brand-light focus:ring-brand-light"
            />

            {/* Bottom Controls - Model Selector, Character Counter & Send Button */}
            <div className="absolute right-3 bottom-3 flex items-center space-x-3">
              {/* Model Selector */}
              <Select value={selectedModel} onValueChange={setModel}>
                <SelectTrigger className="w-32 h-7 text-xs border-border focus:ring-0 focus:ring-offset-0">
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
              <span className="text-xs text-muted-foreground">
                {prompt.length}/{maxLength}
              </span>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!prompt.trim()}
                size="sm"
                className="w-8 h-8 p-0 rounded-full bg-success-light hover:bg-success text-success-dark"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}