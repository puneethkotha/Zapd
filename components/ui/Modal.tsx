"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { m, useReducedMotion } from "framer-motion"
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

const Modal = Dialog.Root
const ModalTrigger = Dialog.Trigger
const ModalClose = Dialog.Close

const ModalPortal = Dialog.Portal

const ModalOverlay = forwardRef<
  ElementRef<typeof Dialog.Overlay>,
  ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))

ModalOverlay.displayName = Dialog.Overlay.displayName

const ModalContent = forwardRef<
  ElementRef<typeof Dialog.Content>,
  ComponentPropsWithoutRef<typeof Dialog.Content> & {
    showClose?: boolean
    disableAnimation?: boolean
  }
>(({ className, children, showClose = true, disableAnimation, ...props }, ref) => {
  const reducedMotion = useReducedMotion()
  const shouldAnimate = !disableAnimation && !reducedMotion

  return (
    <ModalPortal>
      <ModalOverlay />
      <Dialog.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface p-6 shadow-xl duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "rounded-xl",
          className,
        )}
        {...props}
      >
        {shouldAnimate ? (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", duration: 0.2 }}
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
        {showClose && (
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-4 top-4"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </Button>
          </Dialog.Close>
        )}
      </Dialog.Content>
    </ModalPortal>
  )
})

ModalContent.displayName = Dialog.Content.displayName

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

const ModalTitle = forwardRef<
  ElementRef<typeof Dialog.Title>,
  ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none", className)}
    {...props}
  />
))

ModalTitle.displayName = Dialog.Title.displayName

const ModalDescription = forwardRef<
  ElementRef<typeof Dialog.Description>,
  ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
))

ModalDescription.displayName = Dialog.Description.displayName

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2", className)}
    {...props}
  />
)

export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
}
