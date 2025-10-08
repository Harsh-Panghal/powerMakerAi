import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AttributeDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  attribute: any;
}

const dataTypeOptions = [
  { value: ['text', 'string', 'single line of text'], label: 'Single Line of Text' },
  { value: ['picklist'], label: 'Option Set' },
  { value: ['multiselectpicklist'], label: 'Multi Select Picklist' },
  { value: ['boolean'], label: 'Two Options' },
  { value: ['integer', 'wholenumber'], label: 'Whole Number' },
  { value: ['decimal'], label: 'Decimal Number' },
  { value: ['money', 'currency'], label: 'Currency' },
  { value: ['memo', 'multilineoftext'], label: 'Multiple Lines of Text' },
  { value: ['datetime'], label: 'Date and Time' },
];

export function AttributeDetailsDrawer({ isOpen, onClose, attribute }: AttributeDetailsDrawerProps) {
  const [selectedType, setSelectedType] = useState<{ value: string[]; label: string } | null>(null);

  useEffect(() => {
    if (attribute?.dataType) {
      const matched = dataTypeOptions.find(opt =>
        opt.value.map(v => v.toLowerCase()).includes(attribute.dataType.toLowerCase())
      );
      if (matched) {
        setSelectedType(matched);
      }
    }
  }, [attribute]);

  const handleTypeChange = (value: string) => {
    const selected = dataTypeOptions.find(opt => opt.label === value);
    setSelectedType(selected || null);
  };

  if (!attribute) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Attribute Details</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* Display Name */}
          <div>
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={attribute.displayName || ''}
              readOnly
              className="mt-1"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="searchable" 
                checked={attribute.isSearchable || false}
                disabled
              />
              <Label htmlFor="searchable" className="text-sm font-normal">
                Is Searchable
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="audit" 
                checked={attribute.isAuditEnabled || false}
                disabled
              />
              <Label htmlFor="audit" className="text-sm font-normal">
                Is Audit Enabled
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="primary" 
                checked={attribute.isPrimaryAttribute || false}
                disabled
              />
              <Label htmlFor="primary" className="text-sm font-normal">
                Primary Attribute
              </Label>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Type</h3>
            
            {/* Data Type Selector */}
            <div className="mb-4">
              <Label htmlFor="data-type">Data Type</Label>
              <Select value={selectedType?.label || ''} onValueChange={handleTypeChange}>
                <SelectTrigger id="data-type" className="mt-1">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {dataTypeOptions.map((option) => (
                    <SelectItem key={option.label} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields based on Data Type */}
            {selectedType?.label === 'Single Line of Text' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-length">Max Length</Label>
                  <Input
                    id="max-length"
                    value={attribute.maxLength || '100'}
                    readOnly
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Input
                    id="format"
                    value={attribute.format || '(value not provided)'}
                    readOnly
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {selectedType?.label === 'Option Set' && (
              <div className="space-y-3">
                {(() => {
                  let optionsArray: any[] = [];

                  if (Array.isArray(attribute.options)) {
                    optionsArray = attribute.options;
                  } else if (typeof attribute.options === 'object' && attribute.options !== null) {
                    const values = Object.values(attribute.options);
                    optionsArray = values.map((item: any) => {
                      return Object.values(item)[0] ?? item;
                    });
                  }

                  return optionsArray.map((opt: any, index: number) => (
                    <div key={opt?.Value ?? index} className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Option {index + 1}</Label>
                        <Input
                          value={opt?.Label || ''}
                          readOnly
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Value {index + 1}</Label>
                        <Input
                          value={opt?.Value || ''}
                          readOnly
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}

            {(selectedType?.label === 'Whole Number' || 
              selectedType?.label === 'Decimal Number' || 
              selectedType?.label === 'Currency') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Value</Label>
                  <Input
                    value={attribute.minValue || '10'}
                    readOnly
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Max Value</Label>
                  <Input
                    value={attribute.maxValue || '100000'}
                    readOnly
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Precision</Label>
                  <Input
                    value={attribute.precision || '2'}
                    readOnly
                    className="mt-1"
                  />
                </div>
                {selectedType?.label === 'Whole Number' && (
                  <div>
                    <Label>Format</Label>
                    <Input
                      value={attribute.format || '(value not provided)'}
                      readOnly
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            )}

            {selectedType?.label === 'Multiple Lines of Text' && (
              <div>
                <Label>Max Length</Label>
                <Input
                  value={attribute.maxLength || '100'}
                  readOnly
                  className="mt-1"
                />
              </div>
            )}

            {selectedType?.label === 'Date and Time' && (
              <div>
                <Label>Format</Label>
                <Input
                  value={attribute.format || '(value not provided)'}
                  readOnly
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}