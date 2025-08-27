import React, { useState } from 'react';
import { X, Plus, Check, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Connection {
  id: string;
  name: string;
  isSelected: boolean;
}

interface CrmConnectionDetailProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrmConnectionDetail: React.FC<CrmConnectionDetailProps> = ({ isOpen, onClose }) => {
  const [connections, setConnections] = useState<Connection[]>([
    { id: '1', name: 'a', isSelected: true },
    { id: '2', name: 'b', isSelected: false },
  ]);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    connectionName: '',
    tenantId: '',
    clientId: '',
    clientSecret: '',
    resource: '',
    crmSolution: ''
  });

  const handleSelectConnection = (id: string) => {
    setConnections(prev =>
      prev.map(conn => ({
        ...conn,
        isSelected: conn.id === id
      }))
    );
  };

  const handleDeleteConnection = (id: string) => {
    const connectionToDelete = connections.find(conn => conn.id === id);
    const newConnections = connections.filter(conn => conn.id !== id);
    
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
      connectionName: '',
      tenantId: '',
      clientId: '',
      clientSecret: '',
      resource: '',
      crmSolution: ''
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConnection = () => {
    if (formData.connectionName.trim()) {
      const newId = (connections.length + 1).toString();
      const newConnection: Connection = {
        id: newId,
        name: formData.connectionName,
        isSelected: connections.length === 0
      };

      setConnections(prev => [
        ...prev.map(conn => ({ ...conn, isSelected: connections.length === 0 ? false : conn.isSelected })),
        newConnection
      ]);
      
      handleBackToConnections();
    }
  };

  const handleClearForm = () => {
    setFormData({
      connectionName: '',
      tenantId: '',
      clientId: '',
      clientSecret: '',
      resource: '',
      crmSolution: ''
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm text-center font-medium">
              "Your Connection Information Is Protected With Industry-Standard Encryption."
            </p>
          </div>

          {!showForm ? (
            <>
              {/* Add New Connection Button */}
              <Button
                onClick={handleShowAddForm}
                variant="outline"
                className="w-full justify-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <span>Add New Connection</span>
                <Plus className="h-4 w-4" />
              </Button>

              {/* Connection List */}
              <div className="space-y-2 pb-6">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="relative bg-gray-100 rounded-lg p-3 transition-all duration-300 ease-in-out hover:bg-gray-200 group animate-fade-in"
                    onMouseEnter={() => setHoveredConnection(connection.id)}
                    onMouseLeave={() => setHoveredConnection(null)}
                  >
                    {/* Selected indicator inside connection item */}
                    {connection.isSelected && (
                      <div className="absolute top-2 left-3 text-xs text-blue-600 font-medium">
                        Currently Active
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-foreground font-medium">
                        {connection.name}
                      </span>

                      {/* Action Icons with smooth animations */}
                      <div className="flex items-center gap-2">
                        {hoveredConnection === connection.id && (
                          <div className="flex items-center gap-2 animate-fade-in">
                            {/* Show checkmark only for non-selected connections */}
                            {!connection.isSelected && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSelectConnection(connection.id)}
                                className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 animate-scale-in"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Always show delete icon on hover */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteConnection(connection.id)}
                              className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 animate-scale-in"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {connections.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No connections available. Add a new connection to get started.
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
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Connections
              </Button>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="connection-name">Connection Name</Label>
                  <Input 
                    id="connection-name" 
                    placeholder="Enter connection name" 
                    value={formData.connectionName}
                    onChange={(e) => handleFormChange('connectionName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tenant-id">Tenant Id</Label>
                  <Input 
                    id="tenant-id" 
                    placeholder="Enter tenant ID" 
                    value={formData.tenantId}
                    onChange={(e) => handleFormChange('tenantId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input 
                    id="client-id" 
                    placeholder="Enter client ID" 
                    value={formData.clientId}
                    onChange={(e) => handleFormChange('clientId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="client-secret">Client Secret</Label>
                  <Input 
                    id="client-secret" 
                    type="password" 
                    placeholder="Enter client secret" 
                    value={formData.clientSecret}
                    onChange={(e) => handleFormChange('clientSecret', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="resource">Resource (CRM Uri)</Label>
                  <Input 
                    id="resource" 
                    placeholder="Enter CRM URI" 
                    value={formData.resource}
                    onChange={(e) => handleFormChange('resource', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="crm-solution">Default CRM Solution (Unmanaged Only)</Label>
                  <Input 
                    id="crm-solution" 
                    placeholder="Enter CRM solution" 
                    value={formData.crmSolution}
                    onChange={(e) => handleFormChange('crmSolution', e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleClearForm}>
                    Clear
                  </Button>
                  <Button onClick={handleSaveConnection}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};