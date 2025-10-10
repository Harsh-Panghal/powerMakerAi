import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingProgressBar } from "@/components/ui/loading-progress-bar";
import {
  X,
  Search,
  Download,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { TraceDetailsDrawer } from "./TraceDetailsDrawer";

interface PluginTraceLogsProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  traceLogsData: any[];
}

interface TraceRecord {
  createdOn: string;
  typeName: string;
  executionStart: string;
  traceLogId: string;
  messageName: string;
  executionDuration: number;
  stepId: string;
  depth: number;
  primaryEntity: string;
  messageBlock: string;
  exceptionDetails: string;
  correlationId: string;
  stepRank: number;
  createdBy: string;
  stepMode: string;
  stepName: string;
  stepStage: string;
}

interface GroupedDataItem {
  type: "header" | "record";
  data: any;
  groupKey?: string;
  count?: number;
}

export function PluginTraceLogs({
  isOpen,
  onClose,
  onBack,
  traceLogsData = [],
}: PluginTraceLogsProps) {
  const [groupBy, setGroupBy] = useState("none");
  const [recordsPerPage, setRecordsPerPage] = useState("5");
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TraceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Reset state when modal opens with new data
  useEffect(() => {
    if (isOpen && traceLogsData.length > 0) {
      setCurrentPage(1);
      setExpandedGroups(new Set());
    }
  }, [isOpen, traceLogsData]);

  // Filter and group data
  const { groupedData, totalRecords } = useMemo(() => {
    let filtered = [...traceLogsData];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.typeName?.toLowerCase().includes(search) ||
          record.stepName?.toLowerCase().includes(search) ||
          record.correlationId?.toLowerCase().includes(search) ||
          record.createdOn?.toLowerCase().includes(search) ||
          record.executionStart?.toLowerCase().includes(search) ||
          record.primaryEntity?.toLowerCase().includes(search)
      );
    }

    if (groupBy === "none") {
      return {
        groupedData: filtered.map((record) => ({
          type: "record" as const,
          data: record,
        })),
        totalRecords: filtered.length,
      };
    }

    // Group data by correlation ID or type name
    const groupKey = groupBy === "correlation" ? "correlationId" : "typeName";
    const groupMap = new Map<string, any[]>();

    filtered.forEach((record) => {
      const key = record[groupKey] || "N/A";
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(record);
    });

    // Convert to array with headers and records
    const result: GroupedDataItem[] = [];
    const sortedGroups = Array.from(groupMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    sortedGroups.forEach(([key, records]) => {
      result.push({
        type: "header",
        data: key,
        groupKey: key,
        count: records.length,
      });

      if (expandedGroups.has(key)) {
        records.forEach((record) => {
          result.push({
            type: "record",
            data: record,
            groupKey: key,
          });
        });
      }
    });

    return {
      groupedData: result,
      totalRecords: filtered.length,
    };
  }, [traceLogsData, searchTerm, groupBy, expandedGroups]);

  // Pagination calculations
  const recordsPerPageNum = parseInt(recordsPerPage);
  const totalPages = Math.ceil(groupedData.length / recordsPerPageNum);
  const startIndex = (currentPage - 1) * recordsPerPageNum;
  const endIndex = startIndex + recordsPerPageNum;
  const currentPageData = groupedData.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, groupBy, recordsPerPage]);

  const handleViewDetails = (record: TraceRecord) => {
    setSelectedRecord(record);
    setIsDetailsDrawerOpen(true);
  };

  const handleCloseDetailsDrawer = () => {
    setIsDetailsDrawerOpen(false);
    setSelectedRecord(null);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const handleExportCSV = () => {
    const allRecords = traceLogsData.filter((record) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase();
      return (
        record.typeName?.toLowerCase().includes(search) ||
        record.stepName?.toLowerCase().includes(search) ||
        record.correlationId?.toLowerCase().includes(search) ||
        record.createdOn?.toLowerCase().includes(search) ||
        record.executionStart?.toLowerCase().includes(search)
      );
    });

    if (allRecords.length === 0) {
      alert("No records to export");
      return;
    }

    const headers = [
      "Created On",
      "Execution Start",
      "Duration",
      "Plugin Name",
      "Step Name",
      "Correlation ID",
      "Type Name",
    ];
    const csvContent = [
      headers.join(","),
      ...allRecords.map((record) =>
        [
          `"${record.createdOn || ''}"`,
          `"${record.executionStart || ''}"`,
          `"${record.executionDuration || ''}"`,
          `"${record.typeName || ''}"`,
          `"${record.stepName || ''}"`,
          `"${record.correlationId || ''}"`,
          `"${record.typeName || ''}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `plugin-trace-logs-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const hasData = traceLogsData && traceLogsData.length > 0;

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
              <CardTitle className="text-lg sm:text-xl font-semibold">
                Plugin Trace Logs
              </CardTitle>
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
            {hasData ? (
              <>
                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-x-8 gap-y-2 flex-wrap">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <Button
                      variant={groupBy === "none" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGroupBy("none")}
                      className={`text-xs sm:text-sm w-full xs:w-auto ${
                        groupBy === "none"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      No Grouping
                    </Button>
                    <Button
                      variant={
                        groupBy === "correlation" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setGroupBy("correlation")}
                      className={`text-xs sm:text-sm w-full xs:w-auto ${
                        groupBy === "correlation"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      Group by Correlation ID
                    </Button>
                    <Button
                      variant={groupBy === "type" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGroupBy("type")}
                      className={`text-xs sm:text-sm w-full xs:w-auto ${
                        groupBy === "type"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      Group by Type Name
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm w-full xs:w-auto"
                        >
                          <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Search
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Search Trace Logs</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Input
                            placeholder="Search by plugin name, step name, correlation ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchTerm("");
                                setIsSearchOpen(false);
                              }}
                            >
                              Clear
                            </Button>
                            <Button onClick={() => setIsSearchOpen(false)}>
                              Search
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      className="text-xs sm:text-sm w-full xs:w-auto"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-[45vh] overflow-y-auto">
                    <Table className="min-w-full">
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            Created On
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            Execution Start
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            Duration
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            Plugin Name
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            Step Name
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPageData.map((item: GroupedDataItem, index) => {
                          if (item.type === "header") {
                            const isExpanded = expandedGroups.has(
                              item.groupKey!
                            );
                            const groupLabel =
                              groupBy === "correlation"
                                ? "Correlation ID"
                                : "Type Name";

                            return (
                              <TableRow
                                key={`header-${item.groupKey}`}
                                className="bg-muted/30 cursor-pointer hover:bg-muted/50"
                                onClick={() => toggleGroup(item.groupKey!)}
                              >
                                <TableCell
                                  colSpan={5}
                                  className="text-xs sm:text-sm font-medium"
                                >
                                  <div className="flex items-center gap-2">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                    <span>
                                      {groupLabel}: {item.data} ({item.count}{" "}
                                      item{item.count !== 1 ? "s" : ""})
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          } else {
                            const record = item.data as TraceRecord;
                            return (
                              <TableRow
                                key={`record-${record.traceLogId || index}`}
                                className="bg-background/50"
                              >
                                <TableCell
                                  className={`text-xs sm:text-sm ${
                                    groupBy !== "none" ? "pl-8" : ""
                                  }`}
                                >
                                  {record.createdOn || "N/A"}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">
                                  {record.executionStart || "N/A"}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">
                                  {record.executionDuration || "N/A"}
                                </TableCell>
                                <TableCell
                                  className="text-xs sm:text-sm max-w-[200px] truncate"
                                  title={record.typeName}
                                >
                                  {record.typeName || "N/A"}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate">
                                      {record.stepName || "N/A"}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewDetails(record)}
                                      className="text-xs h-7 px-2 whitespace-nowrap"
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          }
                        })}
                        {currentPageData.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm"
                            >
                              {searchTerm
                                ? "No matching records found."
                                : "No trace logs available."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages || 1} (Showing{" "}
                    {startIndex + 1}-{Math.min(endIndex, groupedData.length)}{" "}
                    of {groupedData.length}{" "}
                    {groupBy !== "none" ? "items" : "records"})
                  </div>
                  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage <= 1}
                        className="text-xs sm:text-sm"
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                        className="text-xs sm:text-sm"
                      >
                        Next
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={recordsPerPage}
                        onValueChange={setRecordsPerPage}
                      >
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
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        / page
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <p className="text-muted-foreground text-sm">
                  No trace logs found. Apply filters and click "Show Trace Logs"
                  to view data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Trace Details Drawer */}
      <TraceDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={handleCloseDetailsDrawer}
        selectedRecord={selectedRecord}
      />
    </motion.div>
  );
}