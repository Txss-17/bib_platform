import { forwardRef, useEffect, useState } from "react";
import { Loader2, Check, AlertTriangle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActionState = "idle" | "loading" | "success" | "error";

interface ActionButtonProps extends Omit<ButtonProps, "children"> {
  state?: ActionState;
  /** Idle label / children. */
  children: React.ReactNode;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  /** Auto-revert success/error → idle after N ms. Default 1800ms. */
  resetMs?: number;
}

/**
 * Button with built-in idle/loading/success/error feedback.
 * Drop-in replacement for <Button> when wired to a mutation.
 * Tested visually + unit-tested via Playwright in tests/e2e/editor.spec.ts.
 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  function ActionButton(
    {
      state = "idle",
      children,
      loadingLabel,
      successLabel,
      errorLabel,
      resetMs = 1800,
      disabled,
      className,
      onClick,
      ...rest
    },
    ref,
  ) {
    // Local "echo" state so success/error flash even after the parent mutation
    // resolves and switches back to idle synchronously.
    const [echo, setEcho] = useState<ActionState>(state);
    useEffect(() => {
      setEcho(state);
      if (state === "success" || state === "error") {
        const t = window.setTimeout(() => setEcho("idle"), resetMs);
        return () => window.clearTimeout(t);
      }
    }, [state, resetMs]);

    const isLoading = echo === "loading";
    const isSuccess = echo === "success";
    const isError = echo === "error";

    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={cn(
          "transition-colors",
          isSuccess && "!bg-success !text-success-foreground hover:!bg-success/90",
          isError && "!bg-destructive !text-destructive-foreground hover:!bg-destructive/90",
          className,
        )}
        aria-busy={isLoading || undefined}
        data-state={echo}
        {...rest}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
        {isSuccess && <Check className="w-4 h-4 mr-2" aria-hidden />}
        {isError && <AlertTriangle className="w-4 h-4 mr-2" aria-hidden />}
        <span>
          {isLoading
            ? (loadingLabel ?? "Chargement…")
            : isSuccess
              ? (successLabel ?? "OK")
              : isError
                ? (errorLabel ?? "Erreur")
                : children}
        </span>
      </Button>
    );
  },
);

/** Derive ActionState from a TanStack Query mutation result. */
export function stateFromMutation(m: {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
}): ActionState {
  if (m.isPending) return "loading";
  if (m.isError) return "error";
  if (m.isSuccess) return "success";
  return "idle";
}