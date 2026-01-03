/**
 * Reusable modal frame component that wraps content with consistent styling
 * Used in: Portfolio section modals (Coding, Arts, About, Contact)
 */
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

type ModalFrameProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function ModalFrame({open, onOpenChange, title, children, footer}: ModalFrameProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="border-b border-accent/20 pb-4">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">{children}</div>
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
              className="border-accent/30 hover:bg-accent/10"
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

