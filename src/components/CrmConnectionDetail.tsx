import React, { useState } from 'react';
import { X, Plus, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  const handleAddConnection = () => {
    const newId = (connections.length + 1).toString();
    const newConnection: Connection = {
      id: newId,
      name: String.fromCharCode(97 + connections.length), // a, b, c, etc.
      isSelected: connections.length === 0 // Auto-select if it's the only connection
    };

    // If adding to existing connections, deselect others if this should be selected
    setConnections(prev => [
      ...prev.map(conn => ({ ...conn, isSelected: connections.length === 0 ? false : conn.isSelected })),
      newConnection
    ]);
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

          {/* Add New Connection Button */}
          <Button
            onClick={handleAddConnection}
            variant="outline"
            className="w-full justify-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <span>Add New Connection</span>
            <Plus className="h-4 w-4" />
          </Button>

          {/* Currently Active Label */}
          {connections.some(conn => conn.isSelected) && (
            <div className="text-blue-600 text-sm font-medium">
              Currently Active
            </div>
          )}

          {/* Connection List */}
          <div className="space-y-2 pb-6">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="relative bg-gray-100 rounded-lg p-3 transition-all duration-200 ease-in-out hover:bg-gray-150 group"
                onMouseEnter={() => setHoveredConnection(connection.id)}
                onMouseLeave={() => setHoveredConnection(null)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">
                    {connection.name}
                  </span>

                  {/* Action Icons */}
                  <div className="flex items-center gap-2">
                    {hoveredConnection === connection.id && (
                      <>
                        {/* Show checkmark only for non-selected connections */}
                        {!connection.isSelected && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSelectConnection(connection.id)}
                            className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Always show delete icon on hover */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteConnection(connection.id)}
                          className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Selected indicator */}
                {connection.isSelected && hoveredConnection !== connection.id && (
                  <div className="absolute top-1 left-3 text-xs text-blue-600 font-medium opacity-60">
                    Active
                  </div>
                )}
              </div>
            ))}

            {connections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No connections available. Add a new connection to get started.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};