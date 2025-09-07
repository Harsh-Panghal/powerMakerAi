import React, { useState, useEffect } from "react";
import { X, Plus, Check, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FloatingInput } from "@/components/ui/floating-input";
import { useChatStore, type Connection } from "@/store/chatStore";

interface CrmConnectionDetailProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrmConnectionDetail: React.FC<CrmConnectionDetailProps> = ({
  isOpen,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const { activeConnection, setActiveConnection } = useChatStore();
  const [connections, setConnections] = useState<Connection[]>([
    { id: "1", name: "CRM Dev", isSelected: true },
    { id: "2", name: "CRM UAT", isSelected: false },
    { id: "3", name: "CRM PreProd", isSelected: false },
    { id: "4", name: "CRM Prod", isSelected: false },
  ]);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(
    null
  );
  const sortedConnections = [...connections].sort((a, b) => {
    if (a.isSelected && !b.isSelected) return -1; // selected on top
    if (!a.isSelected && b.isSelected) return 1;
    return 0; // keep others in original order
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    connectionName: "",
    tenantId: "",
    clientId: "",
    clientSecret: "",
    resource: "",
    crmSolution: "",
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Field validation states
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: { hasError: boolean; message: string; showError: boolean };
  }>({});

  const handleSelectConnection = (id: string) => {
    setConnections((prev) => {
      const updatedConnections = prev.map((conn) => ({
        ...conn,
        isSelected: conn.id === id,
      }));
      
      // Find the newly selected connection and update the global state
      const selectedConnection = updatedConnections.find(conn => conn.id === id);
      if (selectedConnection) {
        setActiveConnection(selectedConnection);
      }
      
      return updatedConnections;
    });
  };

  const handleDeleteConnection = (id: string) => {
    const connectionToDelete = connections.find((conn) => conn.id === id);
    const newConnections = connections.filter((conn) => conn.id !== id);

    if (newConnections.length === 0) {
      setConnections([]);
      return;
    }

    // If we deleted the selected connection, auto-select the first remaining
    if (connectionToDelete?.isSelected && newConnections.length > 0) {
      newConnections[0].isSelected = true;
      setActiveConnection(newConnections[0]);
    } else if (newConnections.length === 0) {
      setActiveConnection(null);
    }

    setConnections(newConnections);
  };

  const handleShowAddForm = () => {
    setShowForm(true);
  };

  const handleBackToConnections = () => {
    setShowForm(false);
    setFormData({
      connectionName: "",
      tenantId: "",
      clientId: "",
      clientSecret: "",
      resource: "",
      crmSolution: "",
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Validate field in real-time as user types
    if (value.trim()) {
      validateField(field, value);
    } else {
      // Show error immediately if field becomes empty (for required fields)
      const requiredFields = ["connectionName", "tenantId", "clientId", "clientSecret", "resource"];
      if (requiredFields.includes(field)) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: { 
            hasError: true, 
            message: `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`,
            showError: true 
          }
        }));
      }
    }
  };

  const validateField = (field: string, value: string) => {
    const requiredFields = ["connectionName", "tenantId", "clientId", "clientSecret", "resource"];
    
    if (!requiredFields.includes(field)) return;
    
    let hasError = false;
    let message = "";
    
    if (!value.trim()) {
      hasError = true;
      message = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
    } else {
      // Pattern validation for specific fields
      switch (field) {
        case "tenantId":
        case "clientId":
          // UUID pattern: 8-4-4-4-12 hexadecimal digits
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidPattern.test(value.trim())) {
            hasError = true;
            message = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be a valid UUID format`;
          }
          break;
        case "clientSecret":
          // Client secret pattern: alphanumeric with special characters like ~, _
          const clientSecretPattern = /^[A-Za-z0-9~_.-]{20,}$/;
          if (!clientSecretPattern.test(value.trim())) {
            hasError = true;
            message = "Client Secret must contain valid characters and be at least 20 characters long";
          }
          break;
        case "resource":
          // Environment URL pattern: must be https and contain dynamics.com
          const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.(crm|dynamics)\.com$/i;
          if (!urlPattern.test(value.trim())) {
            hasError = true;
            message = "Resource URL must be a valid Dynamics 365 URL (https://example.crm.dynamics.com)";
          }
          break;
      }
    }
    
    if (hasError) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: { hasError: true, message, showError: true }
      }));
    } else {
      // Clear error when validation passes
      setFieldErrors(prev => ({
        ...prev,
        [field]: { hasError: false, message: "", showError: false }
      }));
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  const handleSaveConnection = () => {
    if (formData.connectionName.trim()) {
      const newId = (connections.length + 1).toString();
      const newConnection: Connection = {
        id: newId,
        name: formData.connectionName,
        isSelected: connections.length === 0,
      };

      setConnections((prev) => {
        const updatedConnections = [
          ...prev.map((conn) => ({
            ...conn,
            isSelected: connections.length === 0 ? false : conn.isSelected,
          })),
          newConnection,
        ];
        
        // If this is the first connection, set it as active
        if (connections.length === 0) {
          setActiveConnection(newConnection);
        }
        
        return updatedConnections;
      });

      handleBackToConnections();
    }
  };

  const handleClearForm = () => {
    setFormData({
      connectionName: "",
      tenantId: "",
      clientId: "",
      clientSecret: "",
      resource: "",
      crmSolution: "",
    });
    setConnectionTestResult(null);
    setFieldErrors({});
  };


  const handleTestConnection = async () => {
    const requiredFields = ["connectionName", "tenantId", "clientId", "clientSecret", "resource"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]?.trim());
    
    if (missingFields.length > 0) {
      setConnectionTestResult({
        success: false,
        message: "Please fill in all required fields"
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      // Simulate API call to test connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success/failure (you can replace this with actual API call)
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo
      
      setConnectionTestResult({
        success: isSuccess,
        message: isSuccess ? "Connection successful!" : "Connection failed. Please check your credentials."
      });
    } catch (error) {
      setConnectionTestResult({
        success: false,
        message: "Connection test failed. Please try again."
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const isFormValid = () => {
    const requiredFields = ["connectionName", "tenantId", "clientId", "clientSecret", "resource"];
    return requiredFields.every(field => formData[field as keyof typeof formData]?.trim());
  };

  // Reusable content component
  const renderContent = () => (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-brand-medium text-sm font-medium">
          Your Connection Information Is Protected With Industry-Standard
          Encryption.
        </p>
      </div>

      {!showForm ? (
        <>
          {/* Add New Connection Button */}
          <Button
            onClick={handleShowAddForm}
            variant="outline"
            className="w-full justify-center gap-1 border-blue-300 text-brand-accent hover:bg-blue-50"
          >
            <span>Add New Connection</span>
            <Plus className="h-4 w-4" />
          </Button>

          {/* Connection List */}
          <div className={`space-y-3 pb-4 pt-2 overflow-y-auto overflow-x-hidden ${isMobile ? 'max-h-[60vh]' : 'max-h-[475px]'}`}>
            <AnimatePresence>
              {/* Selected connection pinned at top */}
              {sortedConnections
                .filter((c) => c.isSelected)
                .map((connection) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`sticky top-0 z-10 overflow-hidden rounded-lg 
border border-brand/30 bg-card shadow-lg shadow-brand/10 
bg-gradient-to-br from-brand/5 via-card to-brand-light/5
transition-all duration-300 ease-in-out group cursor-pointer`}
                    onMouseEnter={() => setHoveredConnection(connection.id)}
                    onMouseLeave={() => setHoveredConnection(null)}
                  >
                    {/* Left border accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand to-brand-light" />

                    {/* Main content (your existing block) */}
                    <div className="p-2 pl-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="relative w-3 h-3 rounded-full bg-success">
                              <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                            </div>
                            <h3 className="font-semibold text-foreground text-base truncate">
                              {connection.name}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand text-primary-foreground">
                              Active
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                              CRM Connection
                            </span>
                            <span className="text-success font-medium">
                              Connected
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1 transition-all duration-300 ${
                            hoveredConnection === connection.id || isMobile
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 translate-x-2"
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConnection(connection.id);
                            }}
                            className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive hover:scale-105 transition-all duration-200"
                            title="Delete connection"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

              {/* Other (non-selected) connections scrollable below */}
              {sortedConnections
                .filter((c) => !c.isSelected)
                .map((connection) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`relative overflow-hidden rounded-lg border bg-card transition-all duration-300 ease-in-out group cursor-pointer
        border-border hover:border-brand/20 hover:shadow-md`}
                    onMouseEnter={() => setHoveredConnection(connection.id)}
                    onMouseLeave={() => setHoveredConnection(null)}
                  >
                    {/* Main content (same UI but not selected) */}
                    <div className="p-2 pl-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                            <h3 className="font-semibold text-foreground text-base truncate">
                              {connection.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                              CRM Connection
                            </span>
                            <span>Available</span>
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1 transition-all duration-300 ${
                            hoveredConnection === connection.id || isMobile
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 translate-x-2"
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectConnection(connection.id);
                            }}
                            className="h-9 w-9 hover:bg-success/10 hover:text-success hover:scale-105 transition-all duration-200"
                            title="Set as active connection"
                          >
                            <Check className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConnection(connection.id);
                            }}
                            className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive hover:scale-105 transition-all duration-200"
                            title="Delete connection"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {connections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No connections available. Add a new connection to get
                started.
              </div>
            )}
          </div>
        </>
      ) : (
        /* Connection Form */
        <div className="space-y-4 pb-6 animate-fade-in">
          <Button
            variant="ghost"
            onClick={handleBackToConnections}
            className="flex items-center gap-2 text-brand-accent  p-2 transition-all duration-300 ease-in-out"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Connections
          </Button>

          <TooltipProvider>
            <div className="space-y-4">
              <div className="relative">
                <FloatingInput
                  label="Connection Name *"
                  value={formData.connectionName}
                  error={fieldErrors.connectionName}
                  onChange={(e) =>
                    handleFormChange("connectionName", e.target.value)
                  }
                  onBlur={(e) => handleFieldBlur("connectionName", e.target.value)}
                />
              </div>

              <div className="relative">
                <FloatingInput
                  label="Tenant Id *"
                  isPassword={true}
                  value={formData.tenantId}
                  error={fieldErrors.tenantId}
                  onChange={(e) => handleFormChange("tenantId", e.target.value)}
                  onBlur={(e) => handleFieldBlur("tenantId", e.target.value)}
                />
              </div>

              <div className="relative">
                <FloatingInput
                  label="Client ID *"
                  isPassword={true}
                  value={formData.clientId}
                  error={fieldErrors.clientId}
                  onChange={(e) => handleFormChange("clientId", e.target.value)}
                  onBlur={(e) => handleFieldBlur("clientId", e.target.value)}
                />
              </div>

              <div className="relative">
                <FloatingInput
                  label="Client Secret *"
                  isPassword={true}
                  value={formData.clientSecret}
                  error={fieldErrors.clientSecret}
                  onChange={(e) =>
                    handleFormChange("clientSecret", e.target.value)
                  }
                  onBlur={(e) => handleFieldBlur("clientSecret", e.target.value)}
                />
              </div>

              <div className="relative">
                <FloatingInput
                  label="Resource (CRM Url) *"
                  value={formData.resource}
                  error={fieldErrors.resource}
                  onChange={(e) => handleFormChange("resource", e.target.value)}
                  onBlur={(e) => handleFieldBlur("resource", e.target.value)}
                />
              </div>

              <FloatingInput
                label="Default CRM Solution (Unmanaged Only)"
                value={formData.crmSolution}
                onChange={(e) =>
                  handleFormChange("crmSolution", e.target.value)
                }
              />
            </div>
          </TooltipProvider>

          {/* Connection Test Result */}
          {connectionTestResult && (
            <div className={`rounded-lg p-3 text-sm font-medium ${
              connectionTestResult.success 
                ? 'bg-success/10 text-success border border-success/20' 
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}>
              {connectionTestResult.message}
            </div>
          )}

          <div className={`flex items-center pt-4 ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={!isFormValid() || isTestingConnection}
              className={`border-brand/20 text-brand hover:bg-brand/5 ${isMobile ? 'w-full' : ''}`}
            >
              {isTestingConnection ? "Testing..." : "Test Connection"}
            </Button>
            
            <div className={`flex space-x-2 ${isMobile ? 'w-full' : ''}`}>
              <Button variant="outline" onClick={handleClearForm} className={isMobile ? 'flex-1' : ''}>
                Clear
              </Button>
              <Button 
                onClick={handleSaveConnection}
                disabled={!connectionTestResult?.success}
                className={`${!connectionTestResult?.success ? "opacity-50 cursor-not-allowed" : ""} ${isMobile ? 'flex-1' : ''}`}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={onClose}>
          <DrawerContent className="max-h-[95vh]">
            <DrawerHeader className="px-4 pt-4 pb-2">
              <DrawerTitle className="text-xl font-semibold text-foreground">
                Dataverse Connections
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto">
              {renderContent()}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[500px] p-0">
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Dataverse Connections
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="px-6 space-y-4">
              {renderContent()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
