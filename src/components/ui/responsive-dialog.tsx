"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "./dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from "./drawer";

/**
 * Hook to detect if viewport is mobile
 */
function useIsMobile(breakpoint: number = 768) {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Initial check
        checkMobile();

        // Listen for resize
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [breakpoint]);

    return isMobile;
}

interface ResponsiveDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

/**
 * ResponsiveDialog - Displays as Dialog on desktop, Drawer on mobile
 */
export function ResponsiveDialog({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    className,
}: ResponsiveDialogProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer isOpen={isOpen} onClose={onClose} className={className}>
                <DrawerContent>
                    {(title || description) && (
                        <DrawerHeader>
                            {title && <DrawerTitle>{title}</DrawerTitle>}
                            {description && <DrawerDescription>{description}</DrawerDescription>}
                        </DrawerHeader>
                    )}
                    {children}
                    {footer && <DrawerFooter>{footer}</DrawerFooter>}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className={className}>
            <DialogContent>
                {(title || description) && (
                    <DialogHeader>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                )}
                {children}
                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
}

// Re-export hooks
export { useIsMobile };
