import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FloatingInput } from "@/components/ui/floating-input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// import all things related to firebase auth
import {
  handleGoogleSignIn,
  handleEmailSignUp,
  handleEmailSignIn,
} from "../config/firebase config/firebase.auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { firestore, auth } from "../config/firebase config/firebase.config";
import saveUserWithReferral from "../functions/saveUserWithReferral";
import { sendPasswordResetEmail } from "firebase/auth";

const Auth = () => {
  // Form component with validation and error handling
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  // Field validation states
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: { hasError: boolean; message: string; showError: boolean };
  }>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function to show error toast
  const showErrorToast = (errorMessage: string) => {
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      className: "border-error bg-error/10 text-error",
      duration: 5000, // 3 seconds
    });
  };

  // Helper function to show success toast
  const showSuccessToast = (successMessage: string) => {
    toast({
      title: "Success",
      description: successMessage,
      className: "border-brand bg-brand/10 text-brand",
      duration: 5000, // 3 seconds
    });
  };

  // Function to check if user exists in Firestore
  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      // Query the users collection to find a user with the given email
      const usersRef = collection(firestore, "users");
      const q = query(
        usersRef,
        where("email", "==", email.trim().toLowerCase())
      );
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  // Validation functions
  const validateField = (field: string, value: string) => {
    let hasError = false;
    let message = "";

    switch (field) {
      case "email":
        if (!value.trim()) {
          hasError = true;
          message = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          hasError = true;
          message = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!value.trim()) {
          hasError = true;
          message = "Password is required";
        } else if (value.length < 8) {
          hasError = true;
          message = "Password must be at least 8 characters long";
        }
        break;
      case "confirmPassword":
        if (!value.trim()) {
          hasError = true;
          message = "Please confirm your password";
        } else if (value !== password) {
          hasError = true;
          message = "Passwords do not match";
        }
        break;
    }

    if (hasError) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: { hasError: true, message, showError: true },
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: { hasError: false, message: "", showError: false },
      }));
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
    }

    // Validate field in real-time as user types
    if (value.trim()) {
      validateField(field, value);
    } else {
      // Show error immediately if field becomes empty (for required fields)
      setFieldErrors((prev) => ({
        ...prev,
        [field]: {
          hasError: true,
          message: `${
            field === "email"
              ? "Email"
              : field === "password"
              ? "Password"
              : "Confirm Password"
          } is required`,
          showError: true,
        },
      }));
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  // Email-Signin handler
  const onEmailSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await handleEmailSignIn(email, password);
      showSuccessToast("Successfully signed in!");
      navigate("/");
    } catch (error: any) {
      // Clean up Firebase error messages
      const errorMessage = "Invalid email or password";
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Email-Signup handler
  const onEmailSignUp = async (
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    if (password !== confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const user = await handleEmailSignUp(email, password);

      // Check if user data already exists to avoid duplicates
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (!userDoc.exists()) {
        await saveUserWithReferral(user.uid, email);
      }

      showSuccessToast(
        "Account created successfully! Please check your email for verification."
      );
      // Switch to sign in form after successful signup
      setIsSignUp(false);
      setPassword("");
      setConfirmPassword("");
      setAcceptTerms(false);
    } catch (error: any) {
      // Clean up Firebase error messages
      const errorMessage =
        error.message?.replace(/^Firebase:\s*/, "") || "Error during sign-up";
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In handler
  const onGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await handleGoogleSignIn();

      // Check if user data already exists to avoid duplicates
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (!userDoc.exists()) {
        await saveUserWithReferral(user.uid, user.email || "");
      }

      showSuccessToast("Successfully signed in with Google!");
      navigate("/");
    } catch (error: any) {
      // Clean up Firebase error messages
      const errorMessage =
        error.message?.replace(/^Firebase:\s*/, "") || "Google Sign-In failed";
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password handler with user existence check
  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    try {
      // First check if user exists in your Firestore database
      const userExists = await checkUserExists(email.trim());

      if (!userExists) {
        showErrorToast(
          "No account found with this email address. Please sign up first."
        );
        return;
      }

      // If user exists, send password reset email
      await sendPasswordResetEmail(auth, email.trim());
      showSuccessToast("Password reset email sent! Please check your inbox.");

      // Clear form and go back to sign in
      setIsForgotPassword(false);
      setEmail("");
      setPassword("");
      setFieldErrors({});
    } catch (error: any) {
      let errorMessage = "Failed to send password reset email";

      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later";
      } else if (error.message) {
        errorMessage = error.message.replace(/^Firebase:\s*/, "");
      }

      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields before submission
    let hasErrors = false;

    // Always validate email
    if (!email.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        email: {
          hasError: true,
          message: "Email is required",
          showError: true,
        },
      }));
      hasErrors = true;
    } else {
      validateField("email", email);
      if (fieldErrors.email?.hasError) hasErrors = true;
    }

    // Validate password for sign in and sign up
    if (!isForgotPassword) {
      if (!password.trim()) {
        setFieldErrors((prev) => ({
          ...prev,
          password: {
            hasError: true,
            message: "Password is required",
            showError: true,
          },
        }));
        hasErrors = true;
      } else {
        validateField("password", password);
        if (fieldErrors.password?.hasError) hasErrors = true;
      }

      // Validate confirm password for sign up
      if (isSignUp) {
        if (!confirmPassword.trim()) {
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: {
              hasError: true,
              message: "Please confirm your password",
              showError: true,
            },
          }));
          hasErrors = true;
        } else {
          validateField("confirmPassword", confirmPassword);
          if (fieldErrors.confirmPassword?.hasError) hasErrors = true;
        }

        if (!acceptTerms) {
          showErrorToast("Please accept the terms and conditions");
          hasErrors = true;
        }
      }
    }

    if (hasErrors) {
      return;
    }

    // Execute appropriate action
    if (isForgotPassword) {
      await handleForgotPassword(email);
    } else if (isSignUp) {
      await onEmailSignUp(email, password, confirmPassword);
    } else {
      await onEmailSignIn(email, password);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden px-4 py-8">
      {/* Smooth flowing background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-brand-light/8 to-brand-medium/5 animate-flow-smooth" />
        <div
          className="absolute inset-0 bg-gradient-to-tl from-brand-accent/3 via-transparent to-brand/4 animate-flow-smooth"
          style={{ animationDelay: "-3s" }}
        />
      </div>

      {/* Static decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-brand/5 rounded-full blur-2xl" />
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-brand-light/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-brand-medium/8 rounded-full blur-xl" />
      </div>

      {/* Main form container */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Card wrapper */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4  flex items-center justify-center">
              <img
                src="./logo.svg"
                className="w-full h-full object-contain"
                alt=""
              />
            </div>
            <h2 className="text-2xl font-bold text-brand">
              {isForgotPassword
                ? "Reset your password"
                : isSignUp
                ? "Sign up to continue"
                : "Sign in to continue"}
            </h2>
          </div>

          {/* Form */}
          <TooltipProvider>
            <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
              {/* Email Field */}
              <FloatingInput
                label="Email *"
                type="email"
                value={email}
                error={fieldErrors.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={(e) => handleFieldBlur("email", e.target.value)}
                autoComplete="email"
              />

              {/* Password Field (Not shown in forgot password mode) */}
              {!isForgotPassword && (
                <FloatingInput
                  label="Password *"
                  isPassword={true}
                  value={password}
                  error={fieldErrors.password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  onBlur={(e) => handleFieldBlur("password", e.target.value)}
                  autoComplete="current-password"
                />
              )}

              {/* Confirm Password Field (Sign Up only) */}
              {isSignUp && !isForgotPassword && (
                <FloatingInput
                  label="Confirm Password *"
                  isPassword={true}
                  value={confirmPassword}
                  error={fieldErrors.confirmPassword}
                  onChange={(e) =>
                    handleFieldChange("confirmPassword", e.target.value)
                  }
                  onBlur={(e) =>
                    handleFieldBlur("confirmPassword", e.target.value)
                  }
                />
              )}

              {/* Terms & Conditions (Sign Up only) */}
              {isSignUp && !isForgotPassword && (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setAcceptTerms(checked === true)
                    }
                    className="mt-1"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-brand leading-relaxed"
                  >
                    Accept{" "}
                    <a href="#" className="text-brand-light hover:underline">
                      terms & conditions
                    </a>{" "}
                    page to get going
                  </Label>
                </div>
              )}

              {/* Forgot Password (Sign In only) */}
              {!isSignUp && !isForgotPassword && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-brand-light hover:underline text-sm"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Back to Sign In (Forgot Password mode) */}
              {isForgotPassword && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setEmail("");
                      setFieldErrors({});
                    }}
                    className="text-brand-light hover:underline text-sm"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-light hover:bg-brand-light/90 text-white font-medium py-3"
              >
                {loading
                  ? "Loading..."
                  : isForgotPassword
                  ? "Send Reset Email"
                  : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
              </Button>

              {/* Or Divider (Not shown in forgot password mode) */}
              {!isForgotPassword && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
              )}

              {/* Google Login (Not shown in forgot password mode) */}
              {!isForgotPassword && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onGoogleSignIn}
                  disabled={loading}
                  className="w-full border-border text-brand hover:bg-muted"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {loading ? "Loading..." : "Login with Google"}
                </Button>
              )}

              {/* Toggle Form (Not shown in forgot password mode) */}
              {!isForgotPassword && (
                <div className="text-center">
                  <p className="text-brand">
                    {isSignUp
                      ? "Already have an account?"
                      : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        // Clear form when switching
                        setPassword("");
                        setConfirmPassword("");
                        setAcceptTerms(false);
                        setFieldErrors({});
                      }}
                      className="text-brand-light hover:underline font-medium"
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </div>
              )}
            </form>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default Auth;
