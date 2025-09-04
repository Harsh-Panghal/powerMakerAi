import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function EntityDetailsTable() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [entityData, setEntityData] = useState({
    schemaName: 'dev_apiconfiguration',
    displayName: 'API Configuration',
    pluralName: 'API Configurations',
    action: 'create',
    ownershipType: 'OrganizationOwned',
    description: '(value not provided)'
  });

  const handleInputChange = (field: string, value: string) => {
    setEntityData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const collapsibleSections = [
    'Entity Definition',
    'Areathat Displaythisentity', 
    'Communication And Collaboration',
    'Data Services',
    'Process'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-brand">Entity Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="schema-name" className="text-sm font-medium">Schema Name</Label>
            <Input 
              id="schema-name" 
              value={entityData.schemaName}
              onChange={(e) => handleInputChange('schemaName', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="display-name" className="text-sm font-medium">Display Name</Label>
            <Input 
              id="display-name" 
              value={entityData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="plural-name" className="text-sm font-medium">Plural Name</Label>
            <Input 
              id="plural-name" 
              value={entityData.pluralName}
              onChange={(e) => handleInputChange('pluralName', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="action" className="text-sm font-medium">Action</Label>
            <Input 
              id="action" 
              value={entityData.action}
              onChange={(e) => handleInputChange('action', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ownership-type" className="text-sm font-medium">Ownership Type</Label>
            <Input 
              id="ownership-type" 
              value={entityData.ownershipType}
              onChange={(e) => handleInputChange('ownershipType', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Input 
              id="description" 
              value={entityData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="mt-1"
              placeholder="Enter description..."
            />
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-2">
          {collapsibleSections.map((section) => (
            <Collapsible 
              key={section}
              open={expandedSections.includes(section)}
              onOpenChange={() => toggleSection(section)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-muted/50 hover:bg-muted/70 rounded-md transition-colors">
                <span className="font-medium">{section}</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.includes(section) ? 'rotate-180' : ''
                  }`} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 bg-background border border-border rounded-md mt-1">
                <p className="text-sm text-muted-foreground">
                  Configuration options for {section.toLowerCase()} will be displayed here.
                </p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}