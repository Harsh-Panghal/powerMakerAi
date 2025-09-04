import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Search, Download, ArrowLeft } from 'lucide-react';

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
        className="bg-background rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-auto"
      >
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 sm:pb-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2 text-brand-accent p-2 transition-all duration-300 ease-in-out text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Trace Filters</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <CardTitle className="text-lg sm:text-xl font-semibold">Plugin Trace Logs</CardTitle>
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
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-x-8 gap-y-2 flex-wrap">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button 
                  variant={groupBy === 'correlation' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('correlation')}
                  className={`text-xs sm:text-sm w-full xs:w-auto ${groupBy === 'correlation' ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <span className="inline">Group by Correlation ID</span>
                  {/* <span className="sm:hidden">Correlation ID</span> */}
                </Button>
                <Button 
                  variant={groupBy === 'type' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy('type')}
                  className={`text-xs sm:text-sm w-full xs:w-auto ${groupBy === 'type' ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <span className="inline">Group by Type Name</span>
                  {/* <span className="sm:hidden">Type Name</span> */}
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full xs:w-auto">
                  <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full xs:w-auto">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="inline">Export CSV</span>
                  {/* <span className="sm:hidden">Export</span> */}
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Created On</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Execution Start</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Duration</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Plugin Name</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Step Name</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Correlation ID</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Type Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
                        No trace logs found. Apply filters and click "Show Trace Logs" to view data.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Page 1 of 0
              </div>
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled className="text-xs sm:text-sm">
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled className="text-xs sm:text-sm">
                    Next
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={recordsPerPage} onValueChange={setRecordsPerPage}>
                    <SelectTrigger className="w-16 sm:w-20 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs sm:text-sm text-muted-foreground">/ page</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}