import React, { useState } from 'react';
import { LoadingProgressBar } from '@/components/ui/loading-progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LoadingProgressBarDemo: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState({
    top: false,
    inline: false,
    overlay: false,
    determinate: false
  });
  const [data, setData] = useState<string | null>(null);

  const simulateApiCall = async (type: keyof typeof loadingStates, duration = 3000) => {
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    setData(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, duration));
      setData(`Data fetched successfully at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">LoadingProgressBar Demo</h1>
          <p className="text-muted-foreground">
            Interactive examples of the LoadingProgressBar component in different configurations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Position Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Top Position
                <Badge variant="outline">Fixed</Badge>
              </CardTitle>
              <CardDescription>
                Progress bar fixed at the top of the screen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => simulateApiCall('top')} 
                disabled={loadingStates.top}
                className="w-full"
              >
                {loadingStates.top ? 'Loading...' : 'Load Data (Top)'}
              </Button>
            </CardContent>
          </Card>

          {/* Inline Position Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Inline Position
                <Badge variant="outline">Inline</Badge>
              </CardTitle>
              <CardDescription>
                Progress bar renders inline with content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => simulateApiCall('inline')} 
                disabled={loadingStates.inline}
                className="w-full"
              >
                {loadingStates.inline ? 'Loading...' : 'Load Data (Inline)'}
              </Button>
              
              <LoadingProgressBar 
                isLoading={loadingStates.inline}
                message="Loading inline data..."
                position="inline"
                colorScheme="primary"
              />
              
              {data && !loadingStates.inline && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-md">
                  <p className="text-sm text-success-foreground">{data}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overlay Position Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Overlay Position
                <Badge variant="outline">Modal</Badge>
              </CardTitle>
              <CardDescription>
                Full-screen overlay with backdrop blur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => simulateApiCall('overlay')} 
                disabled={loadingStates.overlay}
                className="w-full"
              >
                {loadingStates.overlay ? 'Loading...' : 'Load Data (Overlay)'}
              </Button>
            </CardContent>
          </Card>

          {/* Determinate Progress Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Determinate Progress
                <Badge variant="outline">Timed</Badge>
              </CardTitle>
              <CardDescription>
                Progress bar with known duration (5 seconds)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => simulateApiCall('determinate', 5000)} 
                disabled={loadingStates.determinate}
                className="w-full"
              >
                {loadingStates.determinate ? 'Loading...' : 'Load Data (5s Timer)'}
              </Button>
              
              <LoadingProgressBar 
                isLoading={loadingStates.determinate}
                message="Processing your request..."
                position="inline"
                colorScheme="primary"
                duration={5}
              />
            </CardContent>
          </Card>
        </div>

        {/* Color Scheme Examples */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Color Schemes</CardTitle>
            <CardDescription>
              Different color themes available for the progress bar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-medium">Primary Theme</h4>
              <LoadingProgressBar 
                isLoading={true}
                message="Primary color scheme..."
                position="inline"
                colorScheme="primary"
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Light Theme</h4>
              <LoadingProgressBar 
                isLoading={true}
                message="Light color scheme..."
                position="inline"
                colorScheme="light"
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Dark Theme</h4>
              <LoadingProgressBar 
                isLoading={true}
                message="Dark color scheme..."
                position="inline"
                colorScheme="dark"
              />
            </div>
          </CardContent>
        </Card>

        {/* Code Example */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
            <CardDescription>
              How to integrate the LoadingProgressBar in your components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { LoadingProgressBar } from '@/components/ui/loading-progress-bar';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleApiCall = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      // Handle result
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleApiCall}>Fetch Data</button>
      <LoadingProgressBar 
        isLoading={isLoading}
        message="Loading your data..."
        position="top"
        colorScheme="primary"
      />
    </div>
  );
}`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Loading Components */}
      <LoadingProgressBar 
        isLoading={loadingStates.top}
        message="Fetching data from server..."
        position="top"
        colorScheme="primary"
      />

      <LoadingProgressBar 
        isLoading={loadingStates.overlay}
        message="Processing your request..."
        position="overlay"
        colorScheme="primary"
      />
    </div>
  );
};

export { LoadingProgressBarDemo };