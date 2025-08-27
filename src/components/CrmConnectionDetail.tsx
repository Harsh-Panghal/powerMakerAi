import React, { useState } from "react";
import { X, Plus, Check, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/floating-input";

interface Connection {
  id: string;
  name: string;
  isSelected: boolean;
}

interface CrmConnectionDetailProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrmConnectionDetail: React.FC<CrmConnectionDetailProps> = ({
  isOpen,
  onClose,
}) => {
  const [connections, setConnections] = useState<Connection[]>([
    { id: "1", name: "a", isSelected: true },
    { id: "2", name: "b", isSelected: false },
    { id: "3", name: "c", isSelected: false },
    { id: "4", name: "d", isSelected: false },
    { id: "5", name: "e", isSelected: false },
    { id: "6", name: "f", isSelected: false },
  ]);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    connectionName: "",
    tenantId: "",
    clientId: "",
    clientSecret: "",
    resource: "",
    crmSolution: "",
  });

  const handleSelectConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) => ({
        ...conn,
        isSelected: conn.id === id,
      }))
    );
  };

  const handleDeleteConnection = (id: string) => {
    const connectionToDelete = connections.find((conn) => conn.id === id);
    const newConnections = connections.filter((conn) => conn.id !== id);

    if (newConnections.length === 0) {
      setConnections([]);
      return;
    }

    // If we deleted the selected connection, auto-select the first remaining
    if (connectionToDelete?.isSelected) {
      newConnections[0].isSelected = true;
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
  };

  const handleSaveConnection = () => {
    if (formData.connectionName.trim()) {
      const newId = (connections.length + 1).toString();
      const newConnection: Connection = {
        id: newId,
        name: formData.connectionName,
        isSelected: connections.length === 0,
      };

      setConnections((prev) => [
        ...prev.map((conn) => ({
          ...conn,
          isSelected: connections.length === 0 ? false : conn.isSelected,
        })),
        newConnection,
      ]);

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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Crm Connection Detail
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-brand-medium text-sm text-center font-medium">
              "Your Connection Information Is Protected With Industry-Standard
              Encryption."
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
              <div className="space-y-3 pb-6">
                <AnimatePresence>
                  {connections.map((connection) => (
                    <motion.div
                      key={connection.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className={`relative overflow-hidden rounded-lg border bg-card transition-all duration-300 ease-in-out group cursor-pointer
                        ${
                          connection.isSelected
                            ? "border-brand/30 shadow-lg shadow-brand/10 bg-gradient-to-br from-brand/5 via-card to-brand-light/5"
                            : "border-border hover:border-brand/20 hover:shadow-md"
                        }`}
                      onMouseEnter={() => setHoveredConnection(connection.id)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    >
                      {/* Left border accent for active connection */}
                      {connection.isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand to-brand-light" />
                      )}
                      
                      {/* Main content */}
                      <div className="p-4 pl-5">
                        <div className="flex items-center justify-between">
                          {/* Connection info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              {/* Status dot */}
                              <div className={`relative w-3 h-3 rounded-full ${
                                connection.isSelected 
                                  ? "bg-success" 
                                  : "bg-muted-foreground/30"
                              }`}>
                                {connection.isSelected && (
                                  <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                                )}
                              </div>
                              
                              {/* Connection name */}
                              <h3 className="font-semibold text-foreground text-base truncate">
                                {connection.name}
                              </h3>
                              
                              {/* Active badge */}
                              {connection.isSelected && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand text-primary-foreground">
                                  Active
                                </span>
                              )}
                            </div>
                            
                            {/* Connection details */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                CRM Connection
                              </span>
                              <span className={connection.isSelected ? "text-success font-medium" : ""}>
                                {connection.isSelected ? "Connected" : "Available"}
                              </span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className={`flex items-center gap-1 transition-all duration-300 ${
                            hoveredConnection === connection.id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
                          }`}>
                            {!connection.isSelected && (
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
                            )}

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

                      {/* Hover overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-brand/5 to-transparent transition-opacity duration-300 pointer-events-none ${
                        hoveredConnection === connection.id ? "opacity-100" : "opacity-0"
                      }`} />
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

              <div className="space-y-4">
                <FloatingInput
                  label="Connection Name"
                  value={formData.connectionName}
                  onChange={(e) =>
                    handleFormChange("connectionName", e.target.value)
                  }
                />

                <FloatingInput
                  label="Tenant Id"
                  isPassword={true}
                  value={formData.tenantId}
                  onChange={(e) => handleFormChange("tenantId", e.target.value)}
                />

                <FloatingInput
                  label="Client ID"
                  isPassword={true}
                  value={formData.clientId}
                  onChange={(e) => handleFormChange("clientId", e.target.value)}
                />

                <FloatingInput
                  label="Client Secret"
                  isPassword={true}
                  value={formData.clientSecret}
                  onChange={(e) =>
                    handleFormChange("clientSecret", e.target.value)
                  }
                />

                <FloatingInput
                  label="Resource (CRM Url)"
                  value={formData.resource}
                  onChange={(e) => handleFormChange("resource", e.target.value)}
                />

                <FloatingInput
                  label="Default CRM Solution (Unmanaged Only)"
                  value={formData.crmSolution}
                  onChange={(e) =>
                    handleFormChange("crmSolution", e.target.value)
                  }
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleClearForm}>
                  Clear
                </Button>
                <Button onClick={handleSaveConnection}>Save</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
