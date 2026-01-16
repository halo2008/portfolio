"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Simplified Accordion implementation without Radix UI to minimize dependencies for this task
// behaving like standard Shadcn Accordion API

interface AccordionContextType {
    value?: string
    onValueChange?: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextType>({})

const Accordion = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        type?: "single" | "multiple"
        collapsible?: boolean
        defaultValue?: string
        onValueChange?: (value: string) => void
    }
>(({ className, children, ...props }, ref) => {
    const [value, setValue] = React.useState<string>(props.defaultValue || "")

    return (
        <AccordionContext.Provider
            value={{
                value,
                onValueChange: (newValue) => {
                    setValue(newValue === value ? "" : newValue)
                },
            }}
        >
            <div ref={ref} className={cn("", className)} {...props}>
                {children}
            </div>
        </AccordionContext.Provider>
    )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
    <div ref={ref} className={cn("border-b", className)} {...props}>
        {React.Children.map(props.children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, { value })
            }
            return child
        })}
    </div>
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }
>(({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(AccordionContext)
    const isOpen = selectedValue === value

    return (
        <div className="flex">
            <button
                ref={ref}
                onClick={() => value && onValueChange?.(value)}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                    className
                )}
                data-state={isOpen ? "open" : "closed"}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </button>
        </div>
    )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: string }
>(({ className, children, value, ...props }, ref) => {
    const { value: selectedValue } = React.useContext(AccordionContext)
    const isOpen = selectedValue === value

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden text-sm transition-all"
                >
                    <div ref={ref} className={cn("pb-4 pt-0", className)} {...props}>
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
