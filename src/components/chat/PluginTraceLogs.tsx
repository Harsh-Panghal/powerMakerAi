import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Search, Download, ArrowLeft } from 'lucide-react';
import { on } from 'events';

interface PluginTraceLogsProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

export function PluginTraceLogs({ isOpen, onClose, onBack }: PluginTraceLogsProps) {
  const [groupBy, setGroupBy] = useState('correlation');
  const [recordsPerPage, setRecordsPerPage] = useState('5');

  if (!isOpen) return null;

  // Mock data for demonstration
  const mockData = [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2 text-brand-accent  p-2 transition-all duration-300 ease-in-out"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Trace Filters
              </Button>
              <CardTitle className="text-xl font-semibold">Plugin Trace Logs</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant={groupBy === 'correlation' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('correlation')}
                  className={groupBy === 'correlation' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Group by Correlation ID
                </Button>
                <Button 
                  variant={groupBy === 'type' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('type')}
                  className={groupBy === 'type' ? 'bg-primary text-primary-foreground' : ''}
                >
                  Group by Type Name
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Created On</TableHead>
                    <TableHead>Execution Start</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Plugin Name</TableHead>
                    <TableHead>Step Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No trace logs found. Apply filters and click "Show Trace Logs" to view data.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page 1 of 0
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={recordsPerPage} onValueChange={setRecordsPerPage}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">/ page</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}