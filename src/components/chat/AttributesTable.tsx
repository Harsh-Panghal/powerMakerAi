import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AttributeDetailsDrawer } from './AttributeDetailsDrawer';

export function AttributesTable() {
  const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const attributes = [
    {
      displayName: 'API Name',
      schemaName: 'dev_api_name',
      dataType: 'Single Line of Text',
      format: 'Text',
      description: 'The API name of the entity',
      requiredLevel: 'Required',
      maxLength: 100,
      isSearchable: true,
      isAuditEnabled: false,
      isPrimaryAttribute: true
    },
    {
      displayName: 'Status',
      schemaName: 'dev_status',
      dataType: 'Option Set',
      format: 'Picklist',
      description: 'Current status',
      requiredLevel: 'Optional',
      isSearchable: false,
      isAuditEnabled: true,
      isPrimaryAttribute: false
    },
    {
      displayName: 'Categories',
      schemaName: 'dev_categories',
      dataType: 'Multi Select Picklist',
      format: 'MultiPicklist',
      description: 'Multiple categories',
      requiredLevel: 'Optional',
      isSearchable: true,
      isAuditEnabled: false,
      isPrimaryAttribute: false
    },
    {
      displayName: 'Is Active',
      schemaName: 'dev_isactive',
      dataType: 'Two Options',
      format: 'Boolean',
      description: 'Active status',
      requiredLevel: 'Optional',
      isSearchable: false,
      isAuditEnabled: true,
      isPrimaryAttribute: false
    },
    {
      displayName: 'Count',
      schemaName: 'dev_count',
      dataType: 'Whole Number',
      format: 'Integer',
      description: 'Item count',
      requiredLevel: 'Optional',
      maxLength: 10,
      isSearchable: true,
      isAuditEnabled: false,
      isPrimaryAttribute: false
    },
    {
      displayName: 'Price',
      schemaName: 'dev_price',
      dataType: 'Decimal Number',
      format: 'Decimal',
      description: 'Item price',
      requiredLevel: 'Optional',
      isSearchable: false,
      isAuditEnabled: true,
      isPrimaryAttribute: false
    },
    {
      displayName: 'Amount',
      schemaName: 'dev_amount',
      dataType: 'Currency',
      format: 'Money',
      description: 'Total amount',
      requiredLevel: 'Optional',
      isSearchable: true,
      isAuditEnabled: false,
      isPrimaryAttribute: false
    },
    {
      displayName: 'Description',
      schemaName: 'dev_description',
      dataType: 'Multiple Lines of Text',
      format: 'TextArea',
      description: 'Detailed description',
      requiredLevel: 'Optional',
      maxLength: 2000,
      isSearchable: true,
      isAuditEnabled: true,
      isPrimaryAttribute: false
    },
    {
      displayName: 'Created On',
      schemaName: 'dev_createdon',
      dataType: 'Date and Time',
      format: 'DateTime',
      description: 'Creation timestamp',
      requiredLevel: 'System',
      isSearchable: false,
      isAuditEnabled: false,
      isPrimaryAttribute: false
    }
  ];

  const handleDataTypeClick = (attribute: any) => {
    setSelectedAttribute(attribute);
    setIsDrawerOpen(true);
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
              {attributes.map((attribute, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{attribute.displayName}</TableCell>
                  <TableCell className="text-muted-foreground">{attribute.schemaName}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDataTypeClick(attribute)}
                      className="text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {attribute.dataType}
                    </button>
                  </TableCell>
                  <TableCell>{attribute.format}</TableCell>
                  <TableCell className="text-muted-foreground italic">
                    {attribute.description}
                  </TableCell>
                  <TableCell>{attribute.requiredLevel}</TableCell>
                </TableRow>
              ))}
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