import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MatrixButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "outline" | "danger";
}

export const MatrixButton = forwardRef<HTMLButtonElement, MatrixButtonProps>(
  ({ className, isLoading, children, variant = "primary", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative group px-6 py-3 font-mono font-bold text-sm tracking-wider uppercase transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-black",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          
          // Primary Variant (Outlined Green by default per requirements)
          variant === "primary" && [
            "bg-transparent text-primary border border-primary",
            "hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(0,255,0,0.4)]",
            "active:translate-y-0.5"
          ],
          
          // Danger Variant
          variant === "danger" && [
            "bg-transparent text-red-500 border border-red-500",
            "hover:bg-red-500 hover:text-black hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]"
          ],
          
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            PROCESSING...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {children}
          </span>
        )}
      </button>
    );
  }
);
MatrixButton.displayName = "MatrixButton";
