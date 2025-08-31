import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function RelationshipsTable() {
  const relationships: any[] = []; // Empty array to show "No relationship data found"

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
                relationships.map((relationship, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{relationship.targetEntity}</TableCell>
                    <TableCell>{relationship.referencingEntity}</TableCell>
                    <TableCell>{relationship.schemaName}</TableCell>
                    <TableCell>{relationship.displayName}</TableCell>
                    <TableCell>{relationship.requiredLevel}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}