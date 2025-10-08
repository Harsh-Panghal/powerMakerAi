// EntityDetailsTable.tsx - Logic Implementation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export function EntityDetailsTable() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const { crmActionData } = useSelector((state: RootState) => state.crm);

  const [entityData, setEntityData] = useState({
    schemaName: "",
    displayName: "",
    pluralName: "",
    action: "",
    ownershipType: "",
    description: "",
  });

  // Populate entity data from Redux
  useEffect(() => {
    if (crmActionData && crmActionData.entity) {
      const entity = crmActionData.entity;
      setEntityData({
        schemaName: entity.schemaName || "",
        displayName: entity.displayName || "",
        pluralName: entity.displaycollectionname || "",
        action: entity.pma_action || "",
        ownershipType: entity.ownershipType || "user owned",
        description: entity.description || "",
      });
    }
  }, [crmActionData]);

  const handleInputChange = (field: string, value: string) => {
    setEntityData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  // Checkbox labels mapping
  const checkboxLabels: Record<string, string> = {
    isactivity: "Define as an activity entity",
    isvisibleinsales: "Sales",
    isvisibleinservice: "Service",
    isvisibleinmarketing: "Marketing",
    isvisibleintraining: "Training",
    isvisibleinsettings: "Visible",
    ismailmergeenabled: "Mail Merge",
    isduplicatedetectionenabled: "Duplicate Detection",
    isquickcreateenabled: "Allow Quick Create",
    isauditenabled: "Auditing",
    isconnectionsenabled: "Connections",
    isdocumentmanagementenabled: "Document Management",
    isaccessteamsenabled: "Access Teams",
    isknowledgemanagementenabled: "Knowledge Management",
    isslaenabled: "Enable for SLA",
    isqueuesenabled: "Queues",
    isactivitiesenabled: "Activities",
    issendemailenabled: "Send Email",
    isfeedbackenabled: "Feedback",
    isnotesenabled: "Notes Enabled",
    isbusinessprocessenabled: "Business Process Flow",
    ischangetrackingenabled: "Change Tracking",
    hasNotes: "Has Notes",
    hasActivities: "Has Activities",
  };

  // Checkbox groups mapping
  const checkboxGroups: { [group: string]: string[] } = {
    "Entity Definition": ["isactivity"],
    "Areathat Displaythisentity": [
      "isvisibleinsales",
      "isvisibleinservice",
      "isvisibleinmarketing",
      "isvisibleintraining",
      "isvisibleinsettings",
    ],
    "Communication And Collaboration": [
      "ismailmergeenabled",
      "isconnectionsenabled",
      "isdocumentmanagementenabled",
      "isaccessteamsenabled",
      "isknowledgemanagementenabled",
      "isslaenabled",
      "isqueuesenabled",
      "isactivitiesenabled",
      "issendemailenabled",
      "isfeedbackenabled",
      "hasNotes",
      "hasActivities",
    ],
    "Data Services": [
      "isduplicatedetectionenabled",
      "isquickcreateenabled",
      "isauditenabled",
      "ischangetrackingenabled",
    ],
    Process: ["isbusinessprocessenabled"],
  };

  console.log("crm Action DATA", crmActionData);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-brand">
          Entity Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="schema-name" className="text-sm font-medium">
              Schema Name
            </Label>
            <Input
              id="schema-name"
              value={entityData.schemaName}
              placeholder="Enter schema name"
              className="mt-1"
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="display-name" className="text-sm font-medium">
              Display Name
            </Label>
            <Input
              id="display-name"
              value={entityData.displayName}
              placeholder="Enter display name"
              className="mt-1"
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="plural-name" className="text-sm font-medium">
              Plural Name
            </Label>
            <Input
              id="plural-name"
              value={entityData.pluralName}
              placeholder="Enter plural name"
              className="mt-1"
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="action" className="text-sm font-medium">
              Action
            </Label>
            <Input
              id="action"
              value={entityData.action}
              placeholder="Enter action"
              className="mt-1"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ownership-type" className="text-sm font-medium">
              Ownership Type
            </Label>
            <Input
              id="ownership-type"
              value={entityData.ownershipType}
              placeholder="Enter ownership type"
              className="mt-1"
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="description"
              value={entityData.description}
              className="mt-1"
              placeholder="Enter description..."
              readOnly
            />
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(checkboxGroups).map(([section, fields]) => (
            <Collapsible
              key={section}
              open={expandedSections.includes(section)}
              onOpenChange={() => toggleSection(section)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-muted/50 hover:bg-muted/70 rounded-md transition-colors">
                <span className="font-medium">{section}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.includes(section) ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 bg-background border border-border rounded-md mt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {fields.map((fieldName) => {
                    const entity = crmActionData?.entity || {};
                    const isChecked = !!entity[fieldName];
                    
                    return (
                      <div key={fieldName} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={fieldName}
                          checked={isChecked}
                          readOnly
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label
                          htmlFor={fieldName}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {checkboxLabels[fieldName] || fieldName}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
