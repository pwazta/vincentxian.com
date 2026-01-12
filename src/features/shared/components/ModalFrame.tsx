/**
 * Reusable modal frame component that wraps content with consistent styling
 * Used in: Portfolio section modals (Coding, Arts, About, Contact)
 */
import * as React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

type ModalFrameProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function ModalFrame({open, onOpenChange, title, children, footer, className}: ModalFrameProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className ?? "w-[95%] md:w-[90%] md:max-w-[820px] max-h-[90vh]"}>
        <DialogTitle className="text-2xl font-semibold text-foreground">
          {title}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {title} section content
        </DialogDescription>
        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>
        {footer && (
          <DialogFooter className="border-t border-accent/20 pt-3 md:pt-4 flex-shrink-0">
            {footer}
          </DialogFooter>
        )}
        {!footer && (
          <DialogFooter className="border-t border-accent/20 pt-3 md:pt-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-accent/30 hover:bg-accent/10 cursor-pointer"
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

