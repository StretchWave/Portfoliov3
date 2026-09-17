"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/**
 * Custom hook providing accessible focus trapping, Escape key listener,
 * and focus restoration on close.
 */
export function useModalFocusTrap(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  onClose?: () => void
) {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture the trigger element that had focus before opening
    if (document.activeElement instanceof HTMLElement) {
      previousActiveElementRef.current = document.activeElement;
    }

    const container = containerRef.current;
    if (!container) return;

    // Move focus inside the dialog after paint
    const focusTimer = setTimeout(() => {
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        container.focus();
      }
    }, 40);

    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = Array.from(
        container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS) || []
      );
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: Wrap from first to last
        if (document.activeElement === firstElement || document.activeElement === container) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: Wrap from last to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;

      // Restore focus to triggering element
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === "function") {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, containerRef, onClose]);
}
