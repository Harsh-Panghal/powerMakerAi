// TablesView.tsx - Logic Implementation
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Table2, Settings, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityDetailsTable } from "./EntityDetailsTable";
import { AttributesTable } from "./AttributesTable";
import { RelationshipsTable } from "./RelationshipsTable";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { 
  setDeveloperModeEnable,
  setCustomizationResponse,
  setIsLoadingCustomization,
  setShowTables 
} from "@/redux/ChatSlice";

interface TablesViewProps {
  isOpen: boolean;
  onClose: () => void;
  isLoadingTables?: boolean;
}

export function TablesView({ isOpen, onClose }: TablesViewProps) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("entity");
  
  const { crmActionData } = useSelector((state: RootState) => state.crm);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { customizationResponse, isLoadingCustomization } = useSelector(
    (state: RootState) => state.chat
  );

  const handleStartCustomization = async () => {
    if (!isAuthenticated) {
      alert("You must sign in to access Developer Mode.");
      return;
    }

    dispatch(setIsLoadingCustomization(true));
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/users/performcrmcustomisation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(crmActionData),
        }
      );

      const data = await response.json();
      
      if (data && Array.isArray(data.message)) {
        const finalMessage = data.message.join(". ") + ".";
        dispatch(setCustomizationResponse(finalMessage));
      }
      
      dispatch(setDeveloperModeEnable(true));
      
      // Close the tables modal after successful customization
      setTimeout(() => {
        dispatch(setShowTables(false));
      }, 2000);
      
    } catch (error) {
      console.error("Customization failed:", error);
      dispatch(setCustomizationResponse("An error occurred during customization."));
    } finally {
      dispatch(setIsLoadingCustomization(false));
    }
  };

  const handleClose = () => {
    dispatch(setShowTables(false));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 bg-background border border-border rounded-lg shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-brand">
                CRM Entity Configuration
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger
                    value="entity"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Entity Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="attributes"
                    className="flex items-center gap-2"
                  >
                    <Table2 className="h-4 w-4" />
                    Attributes
                  </TabsTrigger>
                  <TabsTrigger
                    value="relationships"
                    className="flex items-center gap-2"
                  >
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

            <div className="p-6 border-t border-border bg-muted/20">
              <div className="flex justify-between items-center">
                <Button
                  variant="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleStartCustomization}
                  disabled={isLoadingCustomization || !crmActionData}
                >
                  {isLoadingCustomization ? "Loading..." : "Start Customization"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="bg-background"
                >
                  <X className="w-3 h-3 mr-1.5" />
                  Close
                </Button>
              </div>
              
              {customizationResponse && (
                <div className="mt-4 border-l-4 border-green-500 rounded-r-xl bg-green-50 p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <div className="ml-3 text-sm text-green-600">
                      <p>{customizationResponse}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}