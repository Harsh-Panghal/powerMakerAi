import { useState } from "react";
import { Send, ChevronDown } from "lucide-react";
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
  { value: "model-0-1", label: "Model 0.1" },
  { value: "crm-customization", label: "CRM Customization" },
  { value: "model-0-2", label: "Model 0.2" },
  { value: "plugin-tracing", label: "Plugin Tracing" },
  { value: "model-0-3", label: "Model 0.3" },
  { value: "crm-expert", label: "CRM Expert" }
];

export function ChatArea() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("model-0-1");
  const maxLength = 1000;

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
      <div className="p-6 border-t border-border bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Textarea */}
            <Textarea
              placeholder="Enter Prompt Here"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, maxLength))}
              className="min-h-[60px] pr-32 resize-none border-brand-light focus:ring-brand-light"
            />
            
            {/* Controls */}
            <div className="absolute right-2 top-2 flex items-center space-x-2">
              {/* Model Selector */}
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-32 h-8 text-xs border-border">
                  <SelectValue />
                  <ChevronDown className="w-3 h-3 ml-1" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
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
    </div>
  );
}