import { useCallback, useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../api";
import { getCSRFToken } from "../utils/csrf";

export interface AuditLogActor {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

export interface AuditLogEntry {
  id: number;
  module: string;
  action: string;
  description: string;
  severity: "info" | "warning" | "error";
  metadata: Record<string, unknown> | null;
  target_object_id: string | null;
  target_object_repr: string;
  actor: AuditLogActor | null;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}

export interface AuditLogFilters {
  page: number;
  pageSize: number;
  module?: string;
  severity?: "info" | "warning" | "error" | "";
  action?: string;
  actor?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

interface AuditLogResponse {
  results: AuditLogEntry[];
  page: number;
  page_size: number;
  total_pages: number;
  total_records: number;
  has_next: boolean;
  has_previous: boolean;
  available_modules: string[];
  available_actions: string[];
}

interface UseAuditLogsReturn {
  logs: AuditLogEntry[];
  loading: boolean;
  error: string | null;
  filters: AuditLogFilters;
  setFilters: (updater: (prev: AuditLogFilters) => AuditLogFilters) => void;
  refresh: () => Promise<void>;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  availableModules: string[];
  availableActions: string[];
}

const buildHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const csrfToken = getCSRFToken();
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  return headers;
};

const DEFAULT_FILTERS: AuditLogFilters = {
  page: 1,
  pageSize: 25,
  module: "",
  severity: "",
  action: "",
  actor: "",
  search: "",
  startDate: "",
  endDate: "",
};

export const useAuditLogs = (
  initialFilters: Partial<AuditLogFilters> = {}
): UseAuditLogsReturn => {
  const [filters, updateFilters] = useState<AuditLogFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [paginationState, setPaginationState] = useState({
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: 1,
    totalRecords: 0,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", filters.page.toString());
      params.set("page_size", filters.pageSize.toString());

      if (filters.module) params.set("module", filters.module);
      if (filters.severity) params.set("severity", filters.severity);
      if (filters.action) params.set("action", filters.action);
      if (filters.actor) params.set("actor", filters.actor);
      if (filters.search) params.set("search", filters.search);
      if (filters.startDate) params.set("start_date", filters.startDate);
      if (filters.endDate) params.set("end_date", filters.endDate);

      const response = await fetch(`${apiBaseUrl}/api/audit-logs/?${params.toString()}`, {
        method: "GET",
        headers: buildHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || response.statusText || "Failed to fetch audit logs");
      }

      const data: AuditLogResponse = await response.json();

      setLogs(data.results);
      setAvailableModules(data.available_modules || []);
      setAvailableActions(data.available_actions || []);
      setPaginationState({
        page: data.page,
        pageSize: data.page_size,
        totalPages: data.total_pages,
        totalRecords: data.total_records,
        hasNext: data.has_next,
        hasPrevious: data.has_previous,
      });
    } catch (err) {
      console.error("Audit log fetch error", err);
      setError(err instanceof Error ? err.message : "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const refresh = useCallback(async () => {
    await fetchLogs();
  }, [fetchLogs]);

  const setFilters = useCallback(
    (updater: (prev: AuditLogFilters) => AuditLogFilters) => {
      updateFilters((prev) => updater(prev));
    },
    []
  );

  const pagination = useMemo(
    () => ({
      page: paginationState.page,
      pageSize: paginationState.pageSize,
      totalPages: paginationState.totalPages,
      totalRecords: paginationState.totalRecords,
      hasNext: paginationState.hasNext,
      hasPrevious: paginationState.hasPrevious,
    }),
    [paginationState]
  );

  return {
    logs,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    pagination,
    availableModules,
    availableActions,
  };
};


