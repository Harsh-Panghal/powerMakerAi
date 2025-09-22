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
import { RootState } from "../store/store";
import { useToast } from "@/hooks/use-toast";
import { setConnections, setRetryTrigger } from "../redux/CrmSlice";
import { useDispatch, useSelector } from "react-redux";

interface CrmConnectionDetailProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrmConnectionDetail: React.FC<CrmConnectionDetailProps> = ({
  isOpen,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { activeConnection, setActiveConnection } = useChatStore();
  const { connections } = useSelector((state: RootState) => state.crm);
  const dispatch = useDispatch();
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(
    null
  );
  const sortedConnections = [...connections].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1; // selected on top
    if (!a.isActive && b.isActive) return 1;
    return 0; // keep others in original order
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    connectionName: "",
    tenantId: "",
    clientId: "",
    clientSecret: "",
    enviromentUrl: "",
    defaultCrmSolutions: "",
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

  // Function to handle setting a connection as active
  const handleSetActiveConnection = async (connectionName: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/users/isactive-connection`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ connectionName }),
        }
      );

      const data = await res.json();

      if (data.success) {
        // Update redux state so only this connection is active
        const updatedConnections = connections.map((conn: any) => ({
          ...conn,
          isActive: conn.connectionName === connectionName,
        }));

        dispatch(setConnections(updatedConnections));
        dispatch(setRetryTrigger());
        onClose();

        toast({
          title: "Success",
          description: "Connection set as active successfully",
          variant: "success",
        });
      } else {
        onClose();
        toast({
          title: "Error",
          description: data.message || "Failed to set active connection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      onClose();
      toast({
        title: "Error",
        description: "Something went wrong while setting active connection.",
        variant: "destructive",
      });
      console.error("Set Active API Error:", error);
    }
  };

  // Function to delete a CRM connection
  const handleDeleteCrmConnection = async (connectionName: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/users/delete-crm-connection`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ connectionName }),
        }
      );

      const data = await res.json();

      if (data.success) {
        dispatch(
          setConnections(
            connections.filter(
              (conn: any) => conn.connectionName !== connectionName
            )
          )
        );
        dispatch(setRetryTrigger());

        toast({
          title: "Success",
          description: "Connection deleted successfully",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete connection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while deleting CRM Connection.",
        variant: "destructive",
      });
      console.error("Delete API Error:", error);
    }
  };
  // Function to show the form for adding a new connection
  const handleShowAddForm = () => {
    setShowForm(true);
  };

  // Function to go back to the list of connections after adding a new one
  const handleBackToConnections = () => {
    setShowForm(false);
    setFormData({
      connectionName: "",
      tenantId: "",
      clientId: "",
      clientSecret: "",
      enviromentUrl: "",
      defaultCrmSolutions: "",
    });
    setConnectionTestResult(null);
    setFieldErrors({});
  };

  // Function to handle form field changes
  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear connection test result when form changes
    if (connectionTestResult) {
      setConnectionTestResult(null);
    }

    // Validate field in real-time as user types
    if (value.trim()) {
      validateField(field, value);
    } else {
      // Show error immediately if field becomes empty (for required fields)
      const requiredFields = [
        "connectionName",
        "tenantId",
        "clientId",
        "clientSecret",
        "enviromentUrl",
      ];
      if (requiredFields.includes(field)) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: {
            hasError: true,
            message: `${field
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())} is required`,
            showError: true,
          },
        }));
      }
    }
  };

  // Function to validate a field and update error state
  const validateField = (field: string, value: string) => {
    const requiredFields = [
      "connectionName",
      "tenantId",
      "clientId",
      "clientSecret",
      "enviromentUrl",
    ];

    if (!requiredFields.includes(field)) return;

    let hasError = false;
    let message = "";

    if (!value.trim()) {
      hasError = true;
      message = `${field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} is required`;
    } else {
      // Pattern validation for specific fields
      switch (field) {
        // case "tenantId":
        // case "clientId":
        //   // UUID pattern: 8-4-4-4-12 hexadecimal digits
        //   const uuidPattern =
        //     /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        //   if (!uuidPattern.test(value.trim())) {
        //     hasError = true;
        //     message = `${field
        //       .replace(/([A-Z])/g, " $1")
        //       .replace(/^./, (str) =>
        //         str.toUpperCase()
        //       )} must be a valid UUID format`;
        //   }
        //   break;
        // case "clientSecret":
        //   // Client secret pattern: alphanumeric with special characters like ~, _
        //   const clientSecretPattern = /^[A-Za-z0-9~_.-]{20,}$/;
        //   if (!clientSecretPattern.test(value.trim())) {
        //     hasError = true;
        //     message =
        //       "Client Secret must contain valid characters and be at least 20 characters long";
        //   }
        //   break;
        case "enviromentUrl":
          // Updated Environment URL pattern to handle various Dynamics 365 URL formats
          const urlPattern =
            /^https:\/\/[a-zA-Z0-9-]+\.crm\d*\.dynamics\.com$/i;
          if (!urlPattern.test(value.trim())) {
            hasError = true;
            message =
              "Environment URL must be a valid Dynamics 365 URL (e.g., https://example.crm.dynamics.com or https://example.crm11.dynamics.com)";
          }
          break;
      }
    }

    if (hasError) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: { hasError: true, message, showError: true },
      }));
    } else {
      // Clear error when validation passes
      setFieldErrors((prev) => ({
        ...prev,
        [field]: { hasError: false, message: "", showError: false },
      }));
    }
  };

  // Function to handle field blur and validate
  const handleFieldBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  // function to handle save connection
  // Enhanced function to handle save connection with better debugging
  const handleSaveConnection = async () => {
    // Validate all required fields before saving
    const requiredFields = [
      "connectionName",
      "tenantId",
      "clientId",
      "clientSecret",
      "enviromentUrl",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]?.trim()
    );

    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Log request details for debugging
      console.log(
        "Making request to:",
        `${import.meta.env.VITE_BACKEND_API}/users/save-crm-connection`
      );
      console.log("Request payload:", formData);
      console.log("Cookies being sent:", document.cookie);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/users/save-crm-connection`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            // Add additional headers that might be required
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      // Log response details for debugging
      console.log("Response status:", res.status);
      console.log("Response headers:", Object.fromEntries(res.headers));

      // Check if response is ok before parsing JSON
      if (!res.ok) {
        // Try to get more detailed error information
        let errorDetails = "";
        let errorMessage = "Failed to save CRM Connection.";

        try {
          // Try to parse as JSON first (in case server sends JSON error)
          const errorData = await res.json();
          errorDetails = errorData.message || errorData.error || "";
          console.log("Error response data:", errorData);
        } catch (jsonError) {
          // If JSON parsing fails, get as text
          try {
            errorDetails = await res.text();
            console.log("Error response text:", errorDetails);
          } catch (textError) {
            console.log("Could not read error response:", textError);
          }
        }

        switch (res.status) {
          case 403:
            errorMessage =
              errorDetails ||
              "Access forbidden. Please check your permissions or try logging in again.";
            // Check if session might have expired
            if (
              errorDetails.toLowerCase().includes("session") ||
              errorDetails.toLowerCase().includes("token") ||
              errorDetails.toLowerCase().includes("unauthorized")
            ) {
              errorMessage =
                "Your session may have expired. Please refresh the page and try again.";
            }
            break;
          case 401:
            errorMessage = "Authentication required. Please log in again.";
            break;
          case 400:
            errorMessage = errorDetails || "Invalid connection data provided.";
            break;
          case 429:
            errorMessage =
              "Too many requests. Please wait a moment and try again.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage =
              errorDetails || `Request failed with status: ${res.status}`;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Try to parse JSON response
      let data;
      try {
        const responseText = await res.text();
        console.log("Response text:", responseText);

        if (responseText.trim() === "") {
          console.log("Empty response received");
          data = { success: true }; // Assume success if empty response but status is OK
        } else {
          data = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);

        toast({
          title: "Error",
          description: "Invalid response format from server.",
          variant: "destructive",
        });
        return;
      }

      console.log("Parsed response data:", data);

      if (data.success) {
        dispatch(
          setConnections([
            ...connections,
            {
              connectionName: formData.connectionName.trim(),
              isActive: connections.length === 0, // Set first entry true, else false
            },
          ])
        );

        toast({
          title: "Success",
          description: "Connection saved successfully",
          className: "border-brand bg-brand/10 text-brand",
        });

        // Reset form and go back to connections list
        handleBackToConnections();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save CRM Connection.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save API Error:", error);

      // Provide more specific error messages based on error type
      let errorMessage = "Failed to save CRM Connection Details.";

      if (error instanceof TypeError) {
        if (error.message.includes("fetch")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.message.includes("JSON")) {
          errorMessage = "Invalid response format from server.";
        }
      } else if (error.name === "AbortError") {
        errorMessage = "Request timeout. Please try again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Also add a function to check authentication status
  // const checkAuthStatus = async () => {
  //   try {
  //     const res = await fetch(
  //       `${import.meta.env.VITE_BACKEND_API}/users/auth-status`,
  //       {
  //         method: "GET",
  //         credentials: "include",
  //         headers: {
  //           Accept: "application/json",
  //         },
  //       }
  //     );

  //     console.log("Auth status response:", res.status);

  //     if (res.ok) {
  //       const data = await res.json();
  //       console.log("Auth status data:", data);
  //       return data;
  //     } else {
  //       console.log("Auth check failed with status:", res.status);
  //       return { authenticated: false };
  //     }
  //   } catch (error) {
  //     console.error("Auth status check error:", error);
  //     return { authenticated: false };
  //   }
  // };

  // function to handle clear form
  const handleClearForm = () => {
    setFormData({
      connectionName: "",
      tenantId: "",
      clientId: "",
      clientSecret: "",
      enviromentUrl: "",
      defaultCrmSolutions: "",
    });
    setConnectionTestResult(null);
    setFieldErrors({});
  };

  //function to handle test connection
  //function to handle test connection
  const handleTestConnection = async () => {
    const requiredFields = [
      "connectionName",
      "tenantId",
      "clientId",
      "clientSecret",
      "enviromentUrl",
    ];

    // Check for missing fields
    const missingFields = requiredFields.filter((field) => {
      const value = formData[field as keyof typeof formData];
      return !value || !value.trim();
    });

    // Only show missing fields error if there are actually missing fields
    if (missingFields.length > 0) {
      setConnectionTestResult({
        success: false,
        message: `Please fill in the following required fields: ${missingFields.join(
          ", "
        )}`,
      });
      return;
    }

    // Check for validation errors (fields with validation issues)
    const fieldsWithErrors = requiredFields.filter(
      (field) => fieldErrors[field]?.hasError === true
    );

    if (fieldsWithErrors.length > 0) {
      setConnectionTestResult({
        success: false,
        message: `Please fix validation errors in: ${fieldsWithErrors.join(
          ", "
        )}`,
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/users/test-crm-connection`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      // Debug: Log the full API response
      console.log("API Response:", data);
      console.log("Request payload sent:", formData);

      if (data.success) {
        setConnectionTestResult({
          success: true,
          message: "Connection test successful!",
        });
      } else {
        setConnectionTestResult({
          success: false,
          message:
            data.message ||
            "Connection test failed. Please check your credentials.",
        });
      }
    } catch (error) {
      setConnectionTestResult({
        success: false,
        message: "Connection test failed. Please try again.",
      });
      console.error("Test API Error:", error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Function to check if the form is valid
  const isFormValid = () => {
    const requiredFields = [
      "connectionName",
      "tenantId",
      "clientId",
      "clientSecret",
      "enviromentUrl",
    ];

    // Check if all required fields have values
    const allFieldsFilled = requiredFields.every((field) => {
      const value = formData[field as keyof typeof formData];
      return value && value.trim().length > 0;
    });

    // Check if there are any validation errors
    const hasValidationErrors = requiredFields.some(
      (field) => fieldErrors[field]?.hasError === true
    );

    return allFieldsFilled && !hasValidationErrors;
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
          <div
            className={`space-y-3 pb-4 pt-2 overflow-y-auto overflow-x-hidden ${
              isMobile ? "max-h-[60vh]" : "max-h-[475px]"
            }`}
          >
            <AnimatePresence>
              {/* Selected connection pinned at top */}
              {sortedConnections
                .filter((c) => c.isActive)
                .map((connection) => (
                  <motion.div
                    key={connection.connectionName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`sticky top-0 z-10 overflow-hidden rounded-lg 
border border-brand/30 bg-card shadow-lg shadow-brand/10 
bg-gradient-to-br from-brand/5 via-card to-brand-light/5
transition-all duration-300 ease-in-out group cursor-pointer`}
                    onMouseEnter={() =>
                      setHoveredConnection(connection.connectionName)
                    }
                    onMouseLeave={() => setHoveredConnection(null)}
                  >
                    {/* Left border accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand to-brand-light" />

                    {/* Main content */}
                    <div className="p-2 pl-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="relative w-3 h-3 rounded-full bg-success">
                              <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                            </div>
                            <h3 className="font-semibold text-foreground text-base truncate">
                              {connection.connectionName}
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
                            hoveredConnection === connection.connectionName ||
                            isMobile
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 translate-x-2"
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCrmConnection(
                                connection.connectionName
                              );
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
                .filter((c) => !c.isActive)
                .map((connection) => (
                  <motion.div
                    key={connection.connectionName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`relative overflow-hidden rounded-lg border bg-card transition-all duration-300 ease-in-out group cursor-pointer
        border-border hover:border-brand/20 hover:shadow-md`}
                    onMouseEnter={() =>
                      setHoveredConnection(connection.connectionName)
                    }
                    onMouseLeave={() => setHoveredConnection(null)}
                  >
                    {/* Main content */}
                    <div className="p-2 pl-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                            <h3 className="font-semibold text-foreground text-base truncate">
                              {connection.connectionName}
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
                            hoveredConnection === connection.connectionName ||
                            isMobile
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 translate-x-2"
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetActiveConnection(
                                connection.connectionName
                              );
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
                              handleDeleteCrmConnection(
                                connection.connectionName
                              );
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
                  onBlur={(e) =>
                    handleFieldBlur("connectionName", e.target.value)
                  }
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
                  onBlur={(e) =>
                    handleFieldBlur("clientSecret", e.target.value)
                  }
                />
              </div>

              <div className="relative">
                <FloatingInput
                  label="Resource (CRM Url) *"
                  value={formData.enviromentUrl}
                  error={fieldErrors.enviromentUrl}
                  onChange={(e) =>
                    handleFormChange("enviromentUrl", e.target.value)
                  }
                  onBlur={(e) =>
                    handleFieldBlur("enviromentUrl", e.target.value)
                  }
                />
              </div>

              <FloatingInput
                label="Default CRM Solution (Unmanaged Only)"
                value={formData.defaultCrmSolutions}
                onChange={(e) =>
                  handleFormChange("defaultCrmSolutions", e.target.value)
                }
              />
            </div>
          </TooltipProvider>

          {/* Connection Test Result */}
          {connectionTestResult && (
            <div
              className={`rounded-lg p-3 text-sm font-medium ${
                connectionTestResult.success
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {connectionTestResult.message}
            </div>
          )}

          <div
            className={`flex items-center pt-4 ${
              isMobile ? "flex-col gap-3" : "justify-between"
            }`}
          >
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={!isFormValid() || isTestingConnection}
              className={`border-brand/20 text-brand hover:bg-brand/5 ${
                isMobile ? "w-full" : ""
              }`}
            >
              {isTestingConnection ? "Testing..." : "Test Connection"}
            </Button>

            <div className={`flex space-x-2 ${isMobile ? "w-full" : ""}`}>
              <Button
                variant="outline"
                onClick={handleClearForm}
                className={isMobile ? "flex-1" : ""}
              >
                Clear
              </Button>
              <Button
                onClick={handleSaveConnection}
                disabled={!connectionTestResult?.success}
                className={`${
                  !connectionTestResult?.success
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } ${isMobile ? "flex-1" : ""}`}
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
            <div className="px-4 pb-4 overflow-y-auto">{renderContent()}</div>
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

            <div className="px-6 space-y-4">{renderContent()}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
