import { useEffect, useMemo, useState } from "react";
import { ClipboardList, RefreshCw, Search } from "lucide-react";
import {
  AuditLogEntry,
  AuditLogFilters,
  useAuditLogs,
} from "../../hooks/useAuditLogs";

const severityLabels: Record<AuditLogEntry["severity"], string> = {
  info: "Info",
  warning: "Warning",
  error: "Error",
};

const severityStyles: Record<AuditLogEntry["severity"], string> = {
  info: "badge-info",
  warning: "badge-warning",
  error: "badge-error",
};

const severityOptions: Array<"" | AuditLogEntry["severity"]> = ["", "info", "warning", "error"];

function StaffAuditLog() {
  const {
    logs,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    pagination,
    availableModules,
    availableActions,
  } = useAuditLogs();

  const [searchValue, setSearchValue] = useState(filters.search ?? "");
  const [actorValue, setActorValue] = useState(filters.actor ?? "");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        search: searchValue,
      }));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchValue, setFilters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        actor: actorValue,
      }));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [actorValue, setFilters]);

  const moduleOptions = useMemo(() => {
    const modules = new Set(["", ...(availableModules ?? [])]);
    return Array.from(modules);
  }, [availableModules]);

  const actionOptions = useMemo(() => {
    const actions = new Set(["", ...(availableActions ?? [])]);
    return Array.from(actions);
  }, [availableActions]);

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleDateChange = (key: "startDate" | "endDate", value: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      [key]: value,
    }));
  };

  const handlePageChange = (nextPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const handlePageSizeChange = (value: string) => {
    const size = Number(value) || 25;
    setFilters((prev) => ({
      ...prev,
      page: 1,
      pageSize: size,
    }));
  };

  const resetFilters = () => {
    setSearchValue("");
    setActorValue("");
    setFilters(() => ({
      page: 1,
      pageSize: 25,
      module: "",
      severity: "",
      action: "",
      actor: "",
      search: "",
      startDate: "",
      endDate: "",
    }));
  };

  const renderMetadata = (metadata: AuditLogEntry["metadata"]) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return <span className="text-base-content/50">—</span>;
    }

    return (
      <details className="group">
        <summary className="cursor-pointer text-primary text-sm">View</summary>
        <pre className="mt-2 max-h-40 overflow-auto rounded bg-base-200 p-3 text-xs text-base-content/80">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </details>
    );
  };

  const formattedLogs = useMemo(
    () =>
      logs.map((log) => ({
        ...log,
        timestamp: new Date(log.created_at).toLocaleString(),
        actorName:
          log.actor?.full_name?.trim() ||
          [log.actor?.first_name, log.actor?.last_name]
            .filter(Boolean)
            .join(" ") ||
          log.actor?.username ||
          "System",
      })),
    [logs]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-base-content">
            <ClipboardList className="h-8 w-8" />
            Audit Log
          </h1>
          <p className="text-base-content/70">
            Review recent staff actions, system events, and sensitive operations in real time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => refresh()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button className="btn btn-ghost btn-sm" onClick={resetFilters} disabled={loading}>
            Clear Filters
          </button>
        </div>
      </header>

      <section className="rounded-lg bg-base-100 p-4 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="form-control w-full">
            <span className="label-text text-sm font-medium">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/60" />
              <input
                type="text"
                className="input input-bordered w-full pl-10"
                placeholder="Search descriptions, modules, or targets"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                disabled={loading}
              />
            </div>
          </label>

          <label className="form-control w-full">
            <span className="label-text text-sm font-medium">Actor</span>
            <input
              type="text"
              className="input input-bordered"
              placeholder="Filter by staff name or username"
              value={actorValue}
              onChange={(event) => setActorValue(event.target.value)}
              disabled={loading}
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text text-sm font-medium">Module</span>
            <select
              className="select select-bordered"
              value={filters.module ?? ""}
              onChange={(event) => handleFilterChange("module", event.target.value)}
              disabled={loading}
            >
              {moduleOptions.map((option) => (
                <option key={option || "all"} value={option}>
                  {option ? option.charAt(0).toUpperCase() + option.slice(1) : "All Modules"}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text text-sm font-medium">Action</span>
            <select
              className="select select-bordered"
              value={filters.action ?? ""}
              onChange={(event) => handleFilterChange("action", event.target.value)}
              disabled={loading}
            >
              {actionOptions.map((option) => (
                <option key={option || "all"} value={option}>
                  {option ? option : "All Actions"}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text text-sm font-medium">Severity</span>
            <select
              className="select select-bordered"
              value={filters.severity ?? ""}
              onChange={(event) => handleFilterChange("severity", event.target.value)}
              disabled={loading}
            >
              {severityOptions.map((option) => (
                <option key={option || "all"} value={option}>
                  {option ? severityLabels[option] : "All Severities"}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text text-sm font-medium">Start Date</span>
            <input
              type="date"
              className="input input-bordered"
              value={filters.startDate ?? ""}
              onChange={(event) => handleDateChange("startDate", event.target.value)}
              disabled={loading}
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text text-sm font-medium">End Date</span>
            <input
              type="date"
              className="input input-bordered"
              value={filters.endDate ?? ""}
              onChange={(event) => handleDateChange("endDate", event.target.value)}
              disabled={loading}
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text text-sm font-medium">Page Size</span>
            <select
              className="select select-bordered"
              value={filters.pageSize}
              onChange={(event) => handlePageSizeChange(event.target.value)}
              disabled={loading}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-lg bg-base-100 shadow">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="whitespace-nowrap">Timestamp</th>
                <th>Actor</th>
                <th>Module</th>
                <th>Action</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Metadata</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <span className="loading loading-dots loading-lg"></span>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-error">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && formattedLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-base-content/60">
                    No audit log entries match the current filters.
                  </td>
                </tr>
              )}

              {!loading && !error && formattedLogs.map((log) => (
                <tr key={log.id} className="align-top">
                  <td className="whitespace-nowrap text-sm">{log.timestamp}</td>
                  <td className="text-sm">
                    <div className="font-medium text-base-content">{log.actorName}</div>
                    {log.actor?.username && (
                      <div className="text-xs text-base-content/60">@{log.actor.username}</div>
                    )}
                  </td>
                  <td className="capitalize text-sm">{log.module || "general"}</td>
                  <td className="text-sm">{log.action}</td>
                  <td className="text-sm">{log.description || "—"}</td>
                  <td className="text-sm">
                    <span className={`badge ${severityStyles[log.severity]} badge-sm`}>{severityLabels[log.severity]}</span>
                  </td>
                  <td className="text-sm">{renderMetadata(log.metadata)}</td>
                  <td className="text-xs font-mono text-base-content/70">
                    {log.ip_address || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-3 border-t border-base-200 p-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-base-content/70">
            Showing page {pagination.page} of {pagination.totalPages} • {pagination.totalRecords} total events
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm"
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={loading || !pagination.hasPrevious}
            >
              Previous
            </button>
            <button
              className="btn btn-sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={loading || !pagination.hasNext}
            >
              Next
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

export default StaffAuditLog;


