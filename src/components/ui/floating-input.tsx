import * as React from "react"
import { Eye, EyeOff, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string
  isPassword?: boolean
  error?: {
    hasError: boolean
    message: string
    showError: boolean
  }
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, isPassword = false, type, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const [showTooltip, setShowTooltip] = React.useState(false)
    const [tooltipTimeout, setTooltipTimeout] = React.useState<NodeJS.Timeout | null>(null)

    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setHasValue(value.length > 0);
      props.onChange?.(e);
    }

    React.useEffect(() => {
      const value = props.value as string;
      setHasValue(value != null && value.length > 0);
    }, [props.value])

    const handleErrorIconHover = () => {
      setShowTooltip(true)
      
      // Clear existing timeout
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout)
      }
      
      // Set new timeout to hide tooltip after 3 seconds
      const timeout = setTimeout(() => {
        setShowTooltip(false)
      }, 3000)
      
      setTooltipTimeout(timeout)
    }

    const handleErrorIconLeave = () => {
      // Don't hide immediately on mouse leave, let the timeout handle it
    }

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (tooltipTimeout) {
          clearTimeout(tooltipTimeout)
        }
      }
    }, [tooltipTimeout])

    return (
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            "flex h-[40px] w-full rounded-md border border-input bg-background px-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-transparent focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm peer",
            error?.hasError && error?.showError && "border-error",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleValueChange}
          {...props}
        />
        <label className={cn(
          "absolute left-3 text-muted-foreground transition-all duration-200 pointer-events-none bg-background px-1",
          (isFocused || hasValue) 
            ? "-top-2 text-xs font-medium" 
            : "top-2.5 text-sm"
        )}>
          {label}
        </label>
        
        {/* Error Icon */}
        {error?.hasError && error?.showError && (
          <div className="absolute right-3 top-3">
            <div 
              className="relative cursor-help"
              onMouseEnter={handleErrorIconHover}
              onMouseLeave={handleErrorIconLeave}
            >
              <AlertTriangle className="h-4 w-4 text-error" />
              
              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-error-light text-error-dark text-xs rounded-md whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95 shadow-lg border border-error/20">
                  {error.message}
                  <div className="absolute top-full right-3 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-error-light" />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Password Toggle - adjust position if error icon is present */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              "absolute top-3 text-muted-foreground hover:text-foreground transition-colors",
              error?.hasError && error?.showError ? "right-10" : "right-3"
            )}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }