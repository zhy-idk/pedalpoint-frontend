import { useState, useMemo, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import {
  useServiceQueue,
  type ServiceQueueItem,
} from "../../hooks/useServiceQueue";
import { Loader2, AlertCircle, CheckCircle, Clock, X } from "lucide-react";
import api from "../../api";

interface QueueItem {
  id: number;
  customer: string;
  description: string;
  fullDescription: string;
  phone: string;
  email: string;
  status: "pending" | "completed";
}

interface QueueData {
  [key: string]: QueueItem[];
}

interface Customer {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

function StaffQueueing() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedQueue, setSelectedQueue] = useState<QueueItem | null>(null);
  const { queueItems, loading, error, refresh, updateQueueItem, addService } =
    useServiceQueue();

  // Add Service Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [serviceConcern, setServiceConcern] = useState("");
  const [addingService, setAddingService] = useState(false);

  // Transform API data to the expected format and group by date
  const queueData: QueueData = useMemo(() => {
    const grouped: QueueData = {};

    queueItems.forEach((item: ServiceQueueItem) => {
      // Skip items without user data
      if (!item.user) {
        console.warn("Queue item missing user data:", item);
        return;
      }

      const dateKey = item.queue_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      // Transform ServiceQueueItem to QueueItem format
      const queueItem: QueueItem = {
        id: item.id,
        customer:
          `${item.user.first_name || ""} ${item.user.last_name || ""}`.trim() ||
          item.user.username ||
          "Unknown",
        description:
          item.info && item.info.length > 50
            ? item.info.substring(0, 50) + "..."
            : item.info || "",
        fullDescription: item.info || "",
        phone: "N/A", // Phone not available in current model
        email: item.user.email || "N/A",
        status: item.status,
      };

      grouped[dateKey].push(queueItem);
    });

    return grouped;
  }, [queueItems]);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const currentDateKey = formatDate(selectedDate);
  const currentQueue = queueData[currentDateKey] || [];

  const pastDueQueueItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return queueItems
      .filter((item) => {
        if (!item.user) return false;
        const itemDate = new Date(item.queue_date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate < today && item.status !== "completed";
      })
      .map((item) => ({
        ...item,
        displayDate: new Date(item.queue_date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }));
  }, [queueItems]);

  const handleStatusUpdate = async (
    itemId: number,
    newStatus: "pending" | "completed",
  ) => {
    const success = await updateQueueItem(itemId, newStatus);
    if (success) {
      // Update local selectedQueue if it's the same item
      if (selectedQueue && selectedQueue.id === itemId) {
        setSelectedQueue({ ...selectedQueue, status: newStatus });
      }
    }
  };

  // Fetch customers when searching
  useEffect(() => {
    if (customerSearch.length >= 2) {
      fetchCustomers();
    } else {
      setCustomers([]);
    }
  }, [customerSearch]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/api/users/?search=${customerSearch}`);
      console.log("Customer search response:", response.data);
      // API returns array directly
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setCustomerSearch("");
    setSelectedCustomer(null);
    setServiceConcern("");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setCustomerSearch("");
    setSelectedCustomer(null);
    setServiceConcern("");
  };

  const handleAddService = async () => {
    if (!selectedCustomer || !serviceConcern.trim()) {
      alert("Please select a customer and enter service concern");
      return;
    }

    setAddingService(true);

    try {
      const queueDate = formatDate(selectedDate);
      const success = await addService(
        queueDate,
        serviceConcern,
        selectedCustomer.id,
      );

      if (success) {
        alert("Service added to queue successfully");
        handleCloseAddModal();
      } else {
        // Show the actual error message from the hook
        const errorMsg = error || "Failed to add service. Please check your permissions.";
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Error adding service:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to add service";
      alert(errorMsg);
    } finally {
      setAddingService(false);
    }
  };

  return (
    <div className="bg-base-200 min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-base-content mb-8 text-3xl font-bold">
          Service Queue Management
        </h1>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="h-4 w-4" />
            <div>
              <div className="font-bold">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading service queue...</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Date Selector and Queue List */}
          <div className="space-y-6 lg:col-span-2">
            {/* Date Selector with React Day Picker */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Select Date</h2>
                <div className="flex justify-center">
                  <button
                    popoverTarget="rdp-popover"
                    className="input input-bordered w-full max-w-md text-left"
                    style={{ anchorName: "--rdp" } as React.CSSProperties}
                  >
                    📅{" "}
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </button>
                  <div
                    popover="auto"
                    id="rdp-popover"
                    className="dropdown"
                    style={{ positionAnchor: "--rdp" } as React.CSSProperties}
                  >
                    <DayPicker
                      className="react-day-picker"
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          // Close the popover after selection
                          const popover = document.getElementById(
                            "rdp-popover",
                          ) as (HTMLElement & { hidePopover?: () => void }) | null;
                          if (popover && popover.hidePopover) {
                            popover.hidePopover();
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="text-base-content/70 mt-4 text-center text-sm">
                  Showing queue for{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="mt-2 flex justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="bg-primary h-3 w-3 rounded-full"></div>
                    <span className="text-xs">Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-accent h-3 w-3 rounded-full"></div>
                    <span className="text-xs">Booked</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-base-300 h-3 w-3 rounded-full"></div>
                    <span className="text-xs">Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Queue List */}
            {!loading && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="card-title">
                      Service Queue ({currentQueue.length} items)
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={refresh}
                        className="btn btn-ghost btn-sm"
                        disabled={loading}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Refresh
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleOpenAddModal}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add Service
                      </button>
                    </div>
                  </div>

                  {currentQueue.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mb-4 text-6xl opacity-20">🔧</div>
                      <h3 className="mb-2 text-lg font-semibold">
                        No services scheduled
                      </h3>
                      <p className="text-base-content/60">
                        No repair services are scheduled for this date.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentQueue.map((item, index) => (
                        <div
                          key={item.id}
                          className="border-base-300 hover:bg-base-200 cursor-pointer rounded-lg border p-4 transition-colors"
                          onClick={() => setSelectedQueue(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-3">
                                <div className="badge badge-primary">
                                  #{index + 1}
                                </div>
                                <h3 className="font-semibold">
                                  {item.customer}
                                </h3>
                                <div className="badge badge-outline">
                                  {item.phone}
                                </div>
                              </div>
                              <p className="text-base-content/70 mb-2 text-sm">
                                {item.description}
                              </p>
                              <div className="flex gap-2">
                                <span
                                  className={`badge badge-sm ${
                                    item.status === "completed"
                                      ? "badge-success"
                                      : "badge-warning"
                                  }`}
                                >
                                  {item.status === "completed"
                                    ? "Completed"
                                    : "Pending"}
                                </span>
                              </div>
                            </div>
                            <div className="dropdown dropdown-end">
                              <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost btn-sm"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                  />
                                </svg>
                              </div>
                              <ul
                                tabIndex={0}
                                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                              >
                                {item.status === "pending" ? (
                                  <li>
                                    <a
                                      onClick={() =>
                                        handleStatusUpdate(item.id, "completed")
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Mark as Completed
                                    </a>
                                  </li>
                                ) : (
                                  <li>
                                    <a
                                      onClick={() =>
                                        handleStatusUpdate(item.id, "pending")
                                      }
                                    >
                                      <Clock className="h-4 w-4" />
                                      Mark as Pending
                                    </a>
                                  </li>
                                )}
                                <li>
                                  <a className="text-warning">Reschedule</a>
                                </li>
                                <li>
                                  <a className="text-error">Cancel</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Past Due Queue */}
            {!loading && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="card-title">
                      Past-Due Services ({pastDueQueueItems.length})
                    </h2>
                    <p className="text-xs text-base-content/60">
                      Showing services scheduled before today that are still pending.
                    </p>
                  </div>

                  {pastDueQueueItems.length === 0 ? (
                    <div className="py-6 text-center text-sm text-base-content/70">
                      Great! No overdue services right now.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pastDueQueueItems.map((item) => (
                        <div
                          key={`past-${item.id}`}
                          className="border border-warning/40 bg-warning/5 rounded-lg p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold">{item.user?.first_name || item.user?.username || "Unknown"}</p>
                              <p className="text-sm text-base-content/70">{item.info}</p>
                              <p className="text-xs text-warning mt-1">
                                Scheduled for {item.displayDate}
                              </p>
                            </div>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setSelectedQueue({
                                  id: item.id,
                                  customer:
                                    `${item.user?.first_name || ""} ${item.user?.last_name || ""}`.trim() ||
                                    item.user?.username ||
                                    "Unknown",
                                  description:
                                    item.info && item.info.length > 50
                                      ? `${item.info.substring(0, 50)}...`
                                      : item.info || "",
                                  fullDescription: item.info || "",
                                  phone: "N/A",
                                  email: item.user?.email || "N/A",
                                  status: item.status,
                                });
                                setSelectedDate(new Date(item.queue_date));
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Service Details Panel */}
          <div className="space-y-6">
            {/* Selected Service Details */}
            {selectedQueue && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title mb-4 text-lg">Service Details</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-base-content/70 text-sm font-semibold">
                        Customer
                      </label>
                      <p className="font-semibold">{selectedQueue.customer}</p>
                    </div>

                    <div>
                      <label className="text-base-content/70 text-sm font-semibold">
                        Contact
                      </label>
                      <p className="text-sm">{selectedQueue.phone}</p>
                      <p className="text-base-content/70 text-sm">
                        {selectedQueue.email}
                      </p>
                    </div>

                    <div>
                      <label className="text-base-content/70 text-sm font-semibold">
                        Service Description
                      </label>
                      <p className="text-sm">{selectedQueue.fullDescription}</p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        className="btn btn-success btn-sm flex-1"
                        disabled={selectedQueue.status === "completed"}
                        onClick={() =>
                          handleStatusUpdate(selectedQueue.id, "completed")
                        }
                      >
                        {selectedQueue.status === "completed"
                          ? "Service Completed"
                          : "Complete Service"}
                      </button>
                      <button className="btn btn-outline btn-sm">Edit</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Add Service to Queue</h3>
                <button
                  onClick={handleCloseAddModal}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Selected Date Display */}
                <div className="alert alert-info">
                  <span className="text-sm">
                    Service will be scheduled for:{" "}
                    <strong>
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </strong>
                  </span>
                </div>

                {/* Customer Selection */}
                <div className="form-control">
                  {selectedCustomer ? (
                    <div>
                      <label className="label">
                        <span className="label-text">Selected Customer</span>
                      </label>
                      <div className="bg-base-200 flex items-center justify-between rounded-lg p-3">
                        <div>
                          <div className="font-medium">
                            {selectedCustomer.first_name}{" "}
                            {selectedCustomer.last_name} (
                            {selectedCustomer.username})
                          </div>
                          <div className="text-base-content/70 text-sm">
                            {selectedCustomer.email}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => setSelectedCustomer(null)}
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <label className="floating-label">
                        <span className="label-text">Search Customer *</span>
                        <input
                          type="text"
                          placeholder="Search Customer *"
                          className="input input-bordered peer w-full"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                      </label>

                      {customerSearch.length >= 2 && customers.length > 0 && (
                        <div className="border-base-300 bg-base-100 absolute z-10 mt-2 max-h-48 w-full overflow-y-auto rounded-lg border shadow-lg">
                          {customers.map((customer) => (
                            <div
                              key={customer.id}
                              className="hover:bg-base-200 border-base-300 cursor-pointer border-b p-3 last:border-b-0"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setCustomerSearch("");
                              }}
                            >
                              <div className="font-medium">
                                {customer.first_name} {customer.last_name} (
                                {customer.username})
                              </div>
                              <div className="text-base-content/70 text-sm">
                                {customer.email}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {customerSearch.length >= 2 && customers.length === 0 && (
                        <div className="text-base-content/60 mt-2 ml-3 text-sm">
                          No customers found
                        </div>
                      )}
                      {customerSearch.length > 0 &&
                        customerSearch.length < 2 && (
                          <div className="text-base-content/60 mt-2 ml-3 text-sm">
                            Type at least 2 characters to search
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Service Concern */}
                <div className="form-control relative">
                  <label className="floating-label">
                    <textarea
                      placeholder="Customer Concern / Service Details *"
                      className="textarea textarea-bordered peer h-32 w-full"
                      value={serviceConcern}
                      onChange={(e) => setServiceConcern(e.target.value)}
                      required
                    />
                    <span className="label-text">
                      Customer Concern / Service Details *
                    </span>
                  </label>

                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Describe the service or repair needed
                    </span>
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="modal-action">
                  <button
                    type="button"
                    className="btn"
                    onClick={handleCloseAddModal}
                    disabled={addingService}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddService}
                    disabled={
                      addingService ||
                      !selectedCustomer ||
                      !serviceConcern.trim()
                    }
                  >
                    {addingService ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Adding...
                      </>
                    ) : (
                      "Add to Queue"
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-backdrop" onClick={handleCloseAddModal}></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffQueueing;
