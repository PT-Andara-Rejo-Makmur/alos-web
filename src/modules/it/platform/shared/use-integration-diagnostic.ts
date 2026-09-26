"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiConfigurationError,
  getBackendBaseUrl,
  getIntegrationDiagnostic,
} from "@/lib/api";
import type { IntegrationDiagnostic } from "@/lib/contracts";

export type DiagnosticState = "checking" | "connected" | "disconnected" | "not-configured";

export interface UseIntegrationDiagnosticResult {
  readonly state: DiagnosticState;
  readonly diagnostic: IntegrationDiagnostic | null;
  readonly correlationId: string | null;
  readonly errorMessage: string | null;
  readonly isChecking: boolean;
  readonly isConnected: boolean;
  readonly refresh: () => void;
}

export function useIntegrationDiagnostic(): UseIntegrationDiagnosticResult {
  const hasBaseUrl = Boolean(getBackendBaseUrl());
  const [state, setState] = useState<DiagnosticState>(() =>
    hasBaseUrl ? "checking" : "not-configured",
  );
  const [diagnostic, setDiagnostic] = useState<IntegrationDiagnostic | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    hasBaseUrl ? null : "Backend not configured",
  );
  const [reloadIndex, setReloadIndex] = useState(0);

  const refresh = useCallback(() => {
    if (!getBackendBaseUrl()) {
      setState("not-configured");
      setDiagnostic(null);
      setErrorMessage("Backend not configured");
      return;
    }
    setState("checking");
    setErrorMessage(null);
    setReloadIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!getBackendBaseUrl()) {
      return;
    }

    const controller = new AbortController();

    getIntegrationDiagnostic(controller.signal)
      .then((data) => {
        setDiagnostic(data);
        setState("connected");
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setDiagnostic(null);
        if (error instanceof ApiConfigurationError) {
          setState("not-configured");
          setErrorMessage("Backend not configured");
        } else {
          setState("disconnected");
          setErrorMessage("Integration diagnostic unavailable");
        }
      });

    return () => {
      controller.abort();
    };
  }, [reloadIndex]);

  return {
    state,
    diagnostic,
    correlationId: diagnostic?.correlation_id ?? null,
    errorMessage,
    isChecking: state === "checking",
    isConnected: state === "connected",
    refresh,
  };
}
