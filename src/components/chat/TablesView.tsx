import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Table2, Settings, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EntityDetailsTable } from './EntityDetailsTable';
import { AttributesTable } from './AttributesTable';
import { RelationshipsTable } from './RelationshipsTable';
import { useChatStore } from '@/store/chatStore';

interface TablesViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TablesView({ isOpen, onClose }: TablesViewProps) {
  const [activeTab, setActiveTab] = useState('entity');
  const { addNotification } = useChatStore();

  const handleStartCustomization = () => {
    // Add notification about entity customization starting
    const now = new Date();
    const endTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes later
    
    addNotification({
      type: "customization",
      title: "Entity Customization Started",
      startDate: now.toLocaleString(),
      endDate: endTime.toLocaleString(),
      plugin: "EntityCustomizer",
      stage: "Initialize"
    });
    
    // Close the tables modal
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 bg-background border border-border rounded-lg shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-brand">CRM Entity Configuration</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="entity" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Entity Details
                  </TabsTrigger>
                  <TabsTrigger value="attributes" className="flex items-center gap-2">
                    <Table2 className="h-4 w-4" />
                    Attributes
                  </TabsTrigger>
                  <TabsTrigger value="relationships" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Relationships
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="entity" className="mt-0">
                  <EntityDetailsTable />
                </TabsContent>
                
                <TabsContent value="attributes" className="mt-0">
                  <AttributesTable />
                </TabsContent>
                
                <TabsContent value="relationships" className="mt-0">
                  <RelationshipsTable />
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/20">
              <div className="flex justify-between items-center">
                <Button 
                  variant="default" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleStartCustomization}
                >
                  Start Customization
                </Button>
                <Button variant="outline" onClick={onClose} className="bg-background">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}