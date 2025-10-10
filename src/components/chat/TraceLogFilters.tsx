import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface TraceLogFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onShowTraceLogs: (filters: any) => void;
  isLoadingTraceLogs?: boolean;
  initialFilters?: any;
}

export function TraceLogFilters({ 
  isOpen, 
  onClose, 
  onShowTraceLogs, 
  isLoadingTraceLogs = false,
  initialFilters 
}: TraceLogFiltersProps) {
  const [showMore, setShowMore] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minDuration: '',
    maxDuration: '',
    operationType: '-1',
    message: '',
    stage: '-1',
    mode: '-1',
    pluginName: '',
    entityName: '',
    correlationId: '',
    initiatedBy: '',
    exception: '',
    recordCount: '100',
    exceptionOnly: false
  });

  // Parse initial filters from the API response
  useEffect(() => {
    if (initialFilters && initialFilters.pluginfilter) {
      const pf = initialFilters.pluginfilter;
      
      setFilters({
        startDate: pf.dateRange?.startDate || '',
        endDate: pf.dateRange?.endDate || '',
        minDuration: pf.minDuration?.toString() || '',
        maxDuration: pf.maxDuration?.toString() || '',
        operationType: pf.operationType?.toString() || '-1',
        message: pf.messageName || '',
        stage: pf.executionStage?.toString() || '-1',
        mode: pf.executionMode?.toString() || '-1',
        pluginName: pf.pluginTypeName || '',
        entityName: pf.entityLogicalName || '',
        correlationId: pf.correlationId || '',
        initiatedBy: pf.initiatingUserName || '',
        exception: pf.errorMessage || '',
        recordCount: pf.recordCount?.toString() || '100',
        exceptionOnly: pf.exceptionOnly || false
      });
    }
  }, [initialFilters]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleShowTraceLogs = () => {
    // Convert filters back to the API format
    const apiFilters = {
      pluginfilter: {
        dateRange: {
          startDate: filters.startDate,
          endDate: filters.endDate
        },
        minDuration: filters.minDuration ? parseInt(filters.minDuration) : null,
        maxDuration: filters.maxDuration ? parseInt(filters.maxDuration) : null,
        operationType: parseInt(filters.operationType),
        messageName: filters.message,
        executionStage: parseInt(filters.stage),
        executionMode: parseInt(filters.mode),
        pluginTypeName: filters.pluginName,
        entityLogicalName: filters.entityName,
        correlationId: filters.correlationId,
        initiatingUserName: filters.initiatedBy,
        errorMessage: filters.exception,
        recordCount: parseInt(filters.recordCount),
        exceptionOnly: filters.exceptionOnly
      }
    };

    onShowTraceLogs(apiFilters);
  };

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
        className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <CardTitle className="text-xl font-semibold">Trace Log Filters</CardTitle>
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
            {/* Date and Duration Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minDuration">Min Duration (ms)</Label>
                <Input
                  id="minDuration"
                  type="number"
                  value={filters.minDuration}
                  onChange={(e) => handleInputChange('minDuration', e.target.value)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDuration">Max Duration (ms)</Label>
                <Input
                  id="maxDuration"
                  type="number"
                  value={filters.maxDuration}
                  onChange={(e) => handleInputChange('maxDuration', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Operation Type</Label>
                <Select value={filters.operationType} onValueChange={(value) => handleInputChange('operationType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">All</SelectItem>
                    <SelectItem value="1">Plug-in</SelectItem>
                    <SelectItem value="2">Workflow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  type="text"
                  placeholder="create, update, delete"
                  value={filters.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={filters.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">All</SelectItem>
                    <SelectItem value="10">Pre-operation</SelectItem>
                    <SelectItem value="20">Pre-validation</SelectItem>
                    <SelectItem value="40">Post-operation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={filters.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">All</SelectItem>
                    <SelectItem value="1">Asynchronous</SelectItem>
                    <SelectItem value="2">Synchronous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expandable Section */}
            {showMore && (
              <>
                {/* Additional Text Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pluginName">Plugin Name</Label>
                    <Input
                      id="pluginName"
                      type="text"
                      placeholder="Plugin Name"
                      value={filters.pluginName}
                      onChange={(e) => handleInputChange('pluginName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entityName">Entity Name</Label>
                    <Input
                      id="entityName"
                      type="text"
                      placeholder="account"
                      value={filters.entityName}
                      onChange={(e) => handleInputChange('entityName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correlationId">Correlation Id</Label>
                    <Input
                      id="correlationId"
                      type="text"
                      placeholder="Correlation Id"
                      value={filters.correlationId}
                      onChange={(e) => handleInputChange('correlationId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="initiatedBy">Initiated By</Label>
                    <Input
                      id="initiatedBy"
                      type="text"
                      placeholder="Initiated By"
                      value={filters.initiatedBy}
                      onChange={(e) => handleInputChange('initiatedBy', e.target.value)}
                    />
                  </div>
                </div>

                {/* Exception */}
                <div className="space-y-2">
                  <Label htmlFor="exception">Exception</Label>
                  <Textarea
                    id="exception"
                    placeholder="Exception"
                    value={filters.exception}
                    onChange={(e) => handleInputChange('exception', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Record Count and Exception Only */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recordCount">Record Count</Label>
                    <Input
                      id="recordCount"
                      type="number"
                      value={filters.recordCount}
                      onChange={(e) => handleInputChange('recordCount', e.target.value)}
                      max="100000"
                      min="1"
                    />
                  </div>
                  <div className="flex items-end space-x-2 pb-2">
                    <Checkbox
                      id="exceptionOnly"
                      checked={filters.exceptionOnly}
                      onCheckedChange={(checked) => handleInputChange('exceptionOnly', !!checked)}
                    />
                    <Label htmlFor="exceptionOnly" className="cursor-pointer">Exception Only</Label>
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button 
                variant="link" 
                className="text-primary flex items-center gap-1 px-0"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    See Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    See More
                  </>
                )}
              </Button>
              <Button 
                onClick={handleShowTraceLogs}
                disabled={isLoadingTraceLogs}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoadingTraceLogs ? 'Loading...' : 'Show Trace Logs'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}