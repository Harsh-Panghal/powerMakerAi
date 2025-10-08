import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AttributeDetailsDrawer } from './AttributeDetailsDrawer';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export function AttributesTable() {
  const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [attributes, setAttributes] = useState<any[]>([]);
  
  const { crmActionData } = useSelector((state: RootState) => state.crm);

  // Populate attributes from Redux
  useEffect(() => {
    if (crmActionData && crmActionData.entity && crmActionData.entity.attributes) {
      const attrs = crmActionData.entity.attributes.map((attr: any) => ({
        displayName: attr.displayName || '(not provided)',
        schemaName: attr.schemaName || '(not provided)',
        dataType: attr.dataType || 'text',
        format: attr.format || 'Text',
        description: attr.description || null,
        requiredLevel: attr.requiredLevel || 'optional',
        maxLength: attr.maxlength,
        minValue: attr.minValue,
        maxValue: attr.maxValue,
        precision: attr.precision,
        options: attr.options,
        isSearchable: attr.IsSearchable,
        isAuditEnabled: attr.isauditEnabled,
        isPrimaryAttribute: attr.isprimary,
      }));
      setAttributes(attrs);
    }
  }, [crmActionData]);

  const handleDataTypeClick = (attribute: any) => {
    setSelectedAttribute(attribute);
    setIsDrawerOpen(true);
  };

  // Map dataType to display label
  const getDataTypeLabel = (dataType: string) => {
    const typeMap: { [key: string]: string } = {
      'text': 'Single Line of Text',
      'string': 'Single Line of Text',
      'picklist': 'Option Set',
      'multiselectpicklist': 'Multi Select Picklist',
      'boolean': 'Two Options',
      'integer': 'Whole Number',
      'wholenumber': 'Whole Number',
      'decimal': 'Decimal Number',
      'money': 'Currency',
      'currency': 'Currency',
      'memo': 'Multiple Lines of Text',
      'multilineoftext': 'Multiple Lines of Text',
      'datetime': 'Date and Time',
    };
    return typeMap[dataType.toLowerCase()] || dataType;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-brand">Attributes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Display Name</TableHead>
                <TableHead className="font-medium">Schema Name</TableHead>
                <TableHead className="font-medium">Data Type</TableHead>
                <TableHead className="font-medium">Format</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                <TableHead className="font-medium">Required Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={6} 
                    className="text-center text-muted-foreground italic py-8"
                  >
                    No attribute data found
                  </TableCell>
                </TableRow>
              ) : (
                attributes.map((attribute, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{attribute.displayName}</TableCell>
                    <TableCell className="text-muted-foreground">{attribute.schemaName}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDataTypeClick(attribute)}
                        className="text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {getDataTypeLabel(attribute.dataType)}
                      </button>
                    </TableCell>
                    <TableCell>{attribute.format}</TableCell>
                    <TableCell className="text-muted-foreground italic">
                      {attribute.description || '(null)'}
                    </TableCell>
                    <TableCell>{attribute.requiredLevel}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <AttributeDetailsDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          attribute={selectedAttribute}
        />
      </CardContent>
    </Card>
  );
}