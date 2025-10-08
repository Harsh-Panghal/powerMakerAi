// ==================== RelationshipsTable.tsx - Logic Implementation ====================
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export function RelationshipsTable() {
  const [relationships, setRelationships] = useState<any[]>([]);
  const { crmActionData } = useSelector((state: RootState) => state.crm);

  // Populate relationships from Redux
  useEffect(() => {
    if (crmActionData && crmActionData.relationships) {
      setRelationships(crmActionData.relationships);
    }
  }, [crmActionData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-brand">Relationships</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Target Entity</TableHead>
                <TableHead className="font-medium">Referencing Entity</TableHead>
                <TableHead className="font-medium">Schema name</TableHead>
                <TableHead className="font-medium">Display Name</TableHead>
                <TableHead className="font-medium">Required Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relationships.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={5} 
                    className="text-center text-muted-foreground italic py-8"
                  >
                    No relationship data found
                  </TableCell>
                </TableRow>
              ) : (
                relationships.map((relationship, index) => {
                  // Check if all values are empty/null
                  const values = Object.values(relationship);
                  const isEmptyRow = values.every(
                    (val) =>
                      val === null ||
                      val === undefined ||
                      val === "" ||
                      val.toString().toLowerCase() === "null" ||
                      val.toString().toLowerCase() === "undefined"
                  );

                  if (isEmptyRow) {
                    return (
                      <TableRow key={index}>
                        <TableCell 
                          colSpan={5} 
                          className="text-center text-muted-foreground italic py-8"
                        >
                          No relationship data found
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {relationship.targetEntity || 'value not provided'}
                      </TableCell>
                      <TableCell>
                        {relationship.referencingEntity || 'value not provided'}
                      </TableCell>
                      <TableCell>
                        {relationship.schemaName || 'value not provided'}
                      </TableCell>
                      <TableCell>
                        {relationship.displayName || 'value not provided'}
                      </TableCell>
                      <TableCell>
                        {relationship.requiredLevel || 'value not provided'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}