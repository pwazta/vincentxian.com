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
      <DialogContent className={className ?? "max-w-[820px]"}>
        <DialogTitle className="text-2xl font-semibold text-foreground">
          {title}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {title} section content
        </DialogDescription>
        <div>{children}</div>
        {footer && (
          <DialogFooter className="border-t border-accent/20 pt-4">
            {footer}
          </DialogFooter>
        )}
        {!footer && (
          <DialogFooter className="border-t border-accent/20 pt-4">
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

