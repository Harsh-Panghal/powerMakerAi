import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AttributesTable() {
  const attributes = [
    {
      displayName: 'Name',
      schemaName: 'dev_name',
      dataType: 'Single Line of Text',
      format: 'Text',
      description: '(null)'
    }
  ];

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.map((attribute, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{attribute.displayName}</TableCell>
                  <TableCell className="text-muted-foreground">{attribute.schemaName}</TableCell>
                  <TableCell>
                    <span className="text-blue-600 font-medium">{attribute.dataType}</span>
                  </TableCell>
                  <TableCell>{attribute.format}</TableCell>
                  <TableCell className="text-muted-foreground italic">
                    {attribute.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}