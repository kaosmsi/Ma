import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TerminalCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function TerminalCard({ children, className, title }: TerminalCardProps) {
  return (
    <div 
      className={cn(
        "relative border border-primary/40 bg-black p-6 shadow-[0_0_15px_rgba(0,255,0,0.1)]",
        "before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:border-t-2 before:border-l-2 before:border-primary",
        "after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:border-b-2 after:border-r-2 after:border-primary",
        className
      )}
    >
      {title && (
        <div className="absolute -top-3 left-4 bg-black px-2 text-xs font-bold text-primary uppercase tracking-widest border border-primary/20">
          {`[ ${title} ]`}
        </div>
      )}
      {children}
    </div>
  );
}
