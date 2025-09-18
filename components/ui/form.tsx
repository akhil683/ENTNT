"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FormContextType {
  control?: any
}

const FormContext = React.createContext<FormContextType>({})

const Form = ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement> & { control?: any }) => {
  return (
    <FormContext.Provider value={{ control: props.control }}>
      <form {...props}>{children}</form>
    </FormContext.Provider>
  )
}

const FormField = ({
  control,
  name,
  render,
}: { control?: any; name: string; render: (field: any) => React.ReactNode }) => {
  // Simplified form field - in a real app you'd integrate with react-hook-form
  const field = {
    name,
    value: "",
    onChange: () => {},
    onBlur: () => {},
  }

  return <>{render({ field })}</>
}

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("space-y-2", className)} {...props} />
  },
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className,
        )}
        {...props}
      />
    )
  },
)
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />
})
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null

    return (
      <p ref={ref} className={cn("text-sm font-medium text-red-600", className)} {...props}>
        {children}
      </p>
    )
  },
)
FormMessage.displayName = "FormMessage"

export { Form, FormControl, FormField, FormItem, FormLabel, FormMessage }
