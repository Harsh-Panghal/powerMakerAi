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
                      className={`relative rounded-xl border transition-all duration-300 ease-in-out group cursor-pointer
                        ${
                          connection.isSelected
                            ? "bg-gradient-to-r from-brand/5 to-brand-light/5 border-brand/20 shadow-sm"
                            : "bg-card border-border/50 hover:border-brand/30 hover:shadow-md"
                        }`}
                      onMouseEnter={() => setHoveredConnection(connection.id)}
                      onMouseLeave={() => setHoveredConnection(null)}
                    >
                      {/* Content Container */}
                      <div className="p-4">
                        {/* Header with name and active badge */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-base">
                                {connection.name}
                              </span>
                              {connection.isSelected && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              CRM Connection
                            </p>
                          </div>

                          {/* Action Icons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {!connection.isSelected && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectConnection(connection.id);
                                }}
                                className="h-8 w-8 hover:bg-success/10 hover:text-success text-muted-foreground transition-all duration-200"
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
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Connection Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              connection.isSelected 
                                ? "bg-success animate-pulse" 
                                : "bg-muted-foreground/30"
                            }`} />
                            <span className="text-sm text-muted-foreground">
                              {connection.isSelected ? "Connected" : "Available"}
                            </span>
                          </div>
                          
                          {connection.isSelected && (
                            <span className="text-xs text-brand font-medium">
                              Primary Connection
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Active Connection Highlight */}
                      {connection.isSelected && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand/5 to-transparent pointer-events-none" />
                      )}
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
