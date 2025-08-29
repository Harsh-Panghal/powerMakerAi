import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string
  isPassword?: boolean
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, isPassword = false, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

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

    return (
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            "flex h-[40px] w-full rounded-md border border-input bg-background px-3  text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-transparent focus-visible:outline-none  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm peer",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleValueChange}
          {...props}
        />
        <label className={cn(
          " absolute left-3 text-muted-foreground transition-all duration-200 pointer-events-none bg-white",
          (isFocused || hasValue) 
            ? "-top-2 text-xs font-medium" 
            : "top-1.5 text-sm"
        )}>
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
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