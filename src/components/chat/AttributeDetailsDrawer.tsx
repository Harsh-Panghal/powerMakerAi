import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttributeDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  attribute: any;
}

export function AttributeDetailsDrawer({ isOpen, onClose, attribute }: AttributeDetailsDrawerProps) {
  const [selectedDataType, setSelectedDataType] = useState(attribute?.dataType || '');
  
  // Update selectedDataType when attribute changes
  useEffect(() => {
    if (attribute?.dataType) {
      setSelectedDataType(attribute.dataType);
    }
  }, [attribute?.dataType]);
  
  if (!attribute) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px] lg:w-[500px] max-w-[90vw] sm:max-w-none">
        <SheetHeader className="flex flex-row items-center justify-between pb-4">
          <SheetTitle className="text-base sm:text-lg font-semibold text-brand">Attribute Details</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={attribute.displayName}
              className="bg-background"
              readOnly
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="searchable" 
                checked={attribute.isSearchable}
                disabled
              />
              <Label 
                htmlFor="searchable" 
                className="text-sm font-normal cursor-pointer"
              >
                Is Searchable
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="auditEnabled" 
                checked={attribute.isAuditEnabled}
                disabled
              />
              <Label 
                htmlFor="auditEnabled" 
                className="text-sm font-normal cursor-pointer"
              >
                Is Audit Enabled
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="primaryAttribute" 
                checked={attribute.isPrimaryAttribute}
                disabled
              />
              <Label 
                htmlFor="primaryAttribute" 
                className="text-sm font-normal cursor-pointer"
              >
                Primary Attribute
              </Label>
            </div>
          </div>

          {/* Type Section */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-brand">Type</h3>
            
            <div className="space-y-2">
              <Label htmlFor="dataType" className="text-sm font-medium">
                Data Type
              </Label>
              <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single Line of Text">Single Line of Text</SelectItem>
                  <SelectItem value="Option Set">Option Set</SelectItem>
                  <SelectItem value="Multi Select Picklist">Multi Select Picklist</SelectItem>
                  <SelectItem value="Two Options">Two Options</SelectItem>
                  <SelectItem value="Whole Number">Whole Number</SelectItem>
                  <SelectItem value="Decimal Number">Decimal Number</SelectItem>
                  <SelectItem value="Currency">Currency</SelectItem>
                  <SelectItem value="Multiple Lines of Text">Multiple Lines of Text</SelectItem>
                  <SelectItem value="Date and Time">Date and Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional fields based on data type */}
            {(selectedDataType === 'Single Line of Text' || 
              selectedDataType === 'Multiple Lines of Text' || 
              selectedDataType === 'Whole Number') && attribute.maxLength && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLength" className="text-sm font-medium">
                    Max Length
                  </Label>
                  <Input
                    id="maxLength"
                    value={attribute.maxLength}
                    className="bg-background"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format" className="text-sm font-medium">
                    Format
                  </Label>
                  <Input
                    id="format"
                    value={attribute.format}
                    className="bg-background"
                    readOnly
                  />
                </div>
              </div>
            )}

            {/* Format only for other types */}
            {!(selectedDataType === 'Single Line of Text' || 
               selectedDataType === 'Multiple Lines of Text' || 
               selectedDataType === 'Whole Number') && (
              <div className="space-y-2">
                <Label htmlFor="format" className="text-sm font-medium">
                  Format
                </Label>
                <Input
                  id="format"
                  value={attribute.format}
                  className="bg-background"
                  readOnly
                />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}