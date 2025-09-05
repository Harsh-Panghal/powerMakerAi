import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, X } from 'lucide-react';

interface TraceLogFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onShowTraceLogs: () => void;
}

export function TraceLogFilters({ isOpen, onClose, onShowTraceLogs }: TraceLogFiltersProps) {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minDuration: '',
    maxDuration: '',
    operationType: 'All',
    message: '',
    stage: 'All',
    mode: 'All',
    pluginName: '',
    entityName: 'account',
    correlationId: '',
    initiatedBy: '',
    exception: '',
    recordCount: '100',
    exceptionOnly: false
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [field]: value }));
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
            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={filters.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Input
                    id="endDate"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={filters.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Duration Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDuration">Min Duration (ms)</Label>
                <Input
                  id="minDuration"
                  type="number"
                  value={filters.minDuration}
                  onChange={(e) => handleInputChange('minDuration', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDuration">Max Duration (ms)</Label>
                <Input
                  id="maxDuration"
                  type="number"
                  value={filters.maxDuration}
                  onChange={(e) => handleInputChange('maxDuration', e.target.value)}
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
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Create">Create</SelectItem>
                    <SelectItem value="Update">Update</SelectItem>
                    <SelectItem value="Delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={filters.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Pre">Pre</SelectItem>
                    <SelectItem value="Post">Post</SelectItem>
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
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Sync">Sync</SelectItem>
                    <SelectItem value="Async">Async</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recordCount">Record Count</Label>
                <Input
                  id="recordCount"
                  type="number"
                  value={filters.recordCount}
                  onChange={(e) => handleInputChange('recordCount', e.target.value)}
                />
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                type="text"
                placeholder="Message"
                value={filters.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
            </div>

            {/* Text Inputs */}
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

            {/* Exception Only Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exceptionOnly"
                checked={filters.exceptionOnly}
                onCheckedChange={(checked) => handleInputChange('exceptionOnly', !!checked)}
              />
              <Label htmlFor="exceptionOnly">Exception Only</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center pt-4">
              {/* <Button variant="link" className="text-primary">
                See Less
              </Button> */}
              <Button 
                onClick={onShowTraceLogs}
                className="bg-primary hover:bg-primary/90"
              >
                Show Trace Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}