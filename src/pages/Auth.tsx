import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FloatingInput } from "@/components/ui/floating-input";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  // Form component with validation and error handling
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Field validation states
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: { hasError: boolean; message: string; showError: boolean };
  }>({});

  const navigate = useNavigate();
  const { toast } = useToast();

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
      setFieldErrors(prev => ({
        ...prev,
        [field]: { hasError: true, message, showError: true }
      }));
    } else {
      setFieldErrors(prev => ({
        ...prev,
        [field]: { hasError: false, message: "", showError: false }
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
      setFieldErrors(prev => ({
        ...prev,
        [field]: { 
          hasError: true, 
          message: `${field === "email" ? "Email" : field === "password" ? "Password" : "Confirm Password"} is required`,
          showError: true 
        }
      }));
    }
  };

  const handleFieldBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate loading for demo purposes
    setTimeout(() => {
      // Set demo user data in localStorage
      localStorage.setItem(
        "demoUser",
        JSON.stringify({
          email: email,
          name: email.split("@")[0], // Use part before @ as name
          isLoggedIn: true,
        })
      );

      toast({
        title: "Success",
        description: "Successfully signed in! (Demo Mode)",
      });
      setLoading(false);
      navigate("/");
    }, 1000);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate loading for demo purposes
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Account created successfully! (Demo Mode)",
      });
      setLoading(false);
      // Switch to sign in form after successful signup
      setIsSignUp(false);
      setPassword("");
      setConfirmPassword("");
      setAcceptTerms(false);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    toast({
      title: "Demo Mode",
      description: "Google login will be implemented later",
    });
  };

  return (
    <div className="h-[100dvh] flex">
      {/* Left Panel - Promotional Area */}
      <div className="hidden lg:flex lg:flex-[5] bg-gradient-to-br from-brand-dark via-brand to-brand-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/90 via-brand/80 to-brand-medium/70" />

        {/* Abstract Wave Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/15 rounded-full blur-lg" />
        </div>

        <div className="relative z-10 flex flex-col  items-start px-16 py-20">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            POWER UP YOUR
            <br />
            CRM WITH AI
          </h1>
          <p className="text-xl text-white/90 leading-relaxed max-w-lg">
            Discover Your Personal AI Assistant Built To Streamline Dynamics
            Customizations, Debug Logs, And Accelerate Development.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="flex-1 lg:flex-[3] flex flex-col justify-center px-8 lg:px-16 py-12 bg-white">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4  flex items-center justify-center">
              <img
                src="./logo.svg"
                className="w-full h-full object-contain"
                alt=""
              />
            </div>
            <h2 className="text-2xl font-bold text-brand">
              {isSignUp ? "Sign up to continue" : "Sign in to continue"}
            </h2>
          </div>

          {/* Form */}
          <TooltipProvider>
            <form
              onSubmit={isSignUp ? handleSignUp : handleSignIn}
              className="space-y-4"
            >
              {/* Email Field */}
              <FloatingInput
                label="Email *"
                type="email"
                value={email}
                error={fieldErrors.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={(e) => handleFieldBlur("email", e.target.value)}
                autoComplete="email"
                required
              />

              {/* Password Field */}
              <FloatingInput
                label="Password *"
                isPassword={true}
                value={password}
                error={fieldErrors.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={(e) => handleFieldBlur("password", e.target.value)}
                autoComplete="current-password"
                required
              />

              {/* Confirm Password Field (Sign Up only) */}
              {isSignUp && (
                <FloatingInput
                  label="Confirm Password *"
                  isPassword={true}
                  value={confirmPassword}
                  error={fieldErrors.confirmPassword}
                  onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                  onBlur={(e) => handleFieldBlur("confirmPassword", e.target.value)}
                  required
                />
              )}

              {/* Terms & Conditions (Sign Up only) */}
              {isSignUp && (
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
              {!isSignUp && (
                <div className="text-right">
                  <a
                    href="#"
                    className="text-brand-light hover:underline text-sm"
                  >
                    Forgot Password?
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-light hover:bg-brand-light/90 text-white font-medium py-3"
              >
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>

              {/* Or Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Google Login - Demo Mode */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
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
                Login with Google
              </Button>

              {/* Toggle Form */}
              <div className="text-center">
                <p className="text-brand">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-brand-light hover:underline font-medium"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </form>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default Auth;
