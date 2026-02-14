
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Stepper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { activeStep: number }
>(({ className, children, activeStep, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex w-full items-center", className)}
    {...props}
  >
    {React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          isActive: index < activeStep,
          isCurrent: index === activeStep,
          isLast: index === React.Children.count(children) - 1,
        } as any);
      }
      return child;
    })}
  </div>
));
Stepper.displayName = "Stepper";

const StepperItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isActive?: boolean; isCurrent?: boolean, isLast?: boolean }
>(({ className, children, isActive, isCurrent, isLast, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center relative", isLast && "flex-none", !isLast && "flex-1", className)}
    {...props}
    data-active={isActive}
    data-current={isCurrent}
  >
    {children}
  </div>
));
StepperItem.displayName = "StepperItem";

const StepperLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm font-medium", className)} {...props} />
));
StepperLabel.displayName = "StepperLabel";


const StepperSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 h-px bg-border mx-4 transition-colors duration-300 ease-in-out group-data-[active=true]:bg-primary",
      className
    )}
    {...props}
  />
));
StepperSeparator.displayName = "StepperSeparator";

export { Stepper, StepperItem, StepperLabel, StepperSeparator };
