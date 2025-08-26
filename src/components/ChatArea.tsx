import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PromptCard } from "./PromptCard";
import { Database, Calendar, Key, Settings } from "lucide-react";

const promptSuggestions = [
  {
    title: "Create a custom entity to store API configuration details and suggest relevant columns.",
    icon: Database
  },
  {
    title: "Add a boolean and a date field to the opportunity entity.",
    icon: Calendar
  },
  {
    title: "I want to store 3rd party integration keys - create a config entity for that!",
    icon: Key
  },
  {
    title: "Create a settings entity for storing SMTP details with column suggestions.",
    icon: Settings
  }
];

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

export function ChatArea() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("model-0-1");
  const maxLength = 1000;

  console.log("ChatArea rendering");

  const handlePromptCardClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleSend = () => {
    if (prompt.trim()) {
      console.log("Sending:", prompt);
      // Handle send logic here
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-layout-main">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {promptSuggestions.map((suggestion, index) => (
              <PromptCard
                key={index}
                title={suggestion.title}
                icon={suggestion.icon}
                onClick={() => handlePromptCardClick(suggestion.title)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Textarea */}
            <Textarea
              placeholder="Enter Prompt Here"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, maxLength))}
              className="min-h-[100px] pr-36 pb-14 resize-none border-brand-light focus:ring-brand-light"
            />
            
            {/* Top Right Controls - Model Selector */}
            <div className="absolute right-3 top-3">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
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
    </div>
  );
}