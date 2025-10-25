import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import {
  Calendar,
  Wrench,
  Clock,
  CheckCircle,
  Zap,
  Bot,
  Loader2,
} from "lucide-react";
import ChatButton from "../components/Chat";
import { apiBaseUrl } from "../api/index";

function Repair() {
  const [date, setDate] = useState<Date | undefined>();
  const [issue, setIssue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasPendingServices, setHasPendingServices] = useState(false);
  const [pendingServicesLoading, setPendingServicesLoading] = useState(false);

  // Get CSRF token using the same method as CartProvider
  const getCSRFToken = () => {
    const name = "csrftoken";
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      // Check if we have authentication cookies
      const hasSessionCookie =
        document.cookie.includes("sessionid") ||
        document.cookie.includes("csrftoken");

      if (!hasSessionCookie) {
        setIsAuthenticated(false);
        setUserId(null);
        return;
      }

      // Try to get user info from cart endpoint (which we know works)
      const response = await fetch(`${apiBaseUrl}/api/cart/`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        // For now, use a default user ID since we need to get it from somewhere
        setUserId("1"); // This should be the actual user ID from your system
        console.log("User authenticated via cart API");
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        console.log("User not authenticated (cart API failed)");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUserId(null);
    }
  };

  // Check for pending services
  const checkPendingServices = async () => {
    if (!isAuthenticated) return;
    
    setPendingServicesLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/queue/check-pending/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "X-CSRFToken": getCSRFToken() || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasPendingServices(data.has_pending_services);
      } else {
        console.error("Error checking pending services");
        setHasPendingServices(false);
      }
    } catch (error) {
      console.error("Error checking pending services:", error);
      setHasPendingServices(false);
    } finally {
      setPendingServicesLoading(false);
    }
  };

  // Check auth on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check pending services when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      checkPendingServices();
    }
  }, [isAuthenticated]);

  const disabledDays = [
    { before: new Date() },
    { dayOfWeek: [0, 6] }, // Disable weekends
  ];

  const handleSubmit = async () => {
    if (!date || !issue.trim()) {
      alert("Please select a date and describe the issue");
      return;
    }

    if (!isAuthenticated || !userId) {
      alert("Please log in to schedule a repair");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Format date to YYYY-MM-DD
      const formattedDate = date.toISOString().split("T")[0];

      const csrfToken = getCSRFToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      const response = await fetch(`${apiBaseUrl}/api/queue/add/`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          queue_date: formattedDate,
          info: issue.trim(),
          user: parseInt(userId || "1"),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule repair: ${response.statusText}`);
      }

      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to schedule repair",
      );
      console.error("Error scheduling repair:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-200 min-h-screen px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold">Bike Repair Service</h1>
          <p className="text-base-content/60 mx-auto max-w-md">
            Schedule your bike repair appointment with our professional
            technicians
          </p>
        </div>

        {/* Main Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Date Selection */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text flex items-center text-lg font-semibold">
                  <Calendar className="mr-2" size={20} />
                  Select a Date
                </span>
              </label>
              <button
                popoverTarget="rdp-popover"
                className="input input-bordered flex w-full items-center justify-between text-left"
                style={{ anchorName: "--rdp" } as React.CSSProperties}
              >
                <span className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {date
                    ? date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Pick a date"}
                </span>
              </button>

              <div
                popover="auto"
                id="rdp-popover"
                className="dropdown bg-base-100 border-base-300 z-50 rounded-lg border p-4 shadow-xl"
                style={{ positionAnchor: "--rdp" } as React.CSSProperties}
              >
                <DayPicker
                  className="react-day-picker w-full"
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={disabledDays}
                />

                <div className="bg-base-200 text-base-content/70 mt-4 rounded-lg p-3 text-center text-xs">
                  <p className="font-medium">Service Hours: Mon-Fri, 8AM-5PM</p>
                  <p>Weekends unavailable</p>
                </div>
              </div>

              {date && (
                <label className="label">
                  <span className="label-text-alt text-success flex items-center">
                    <CheckCircle size={16} className="mr-1" />
                    Date confirmed
                  </span>
                </label>
              )}
            </div>

            {/* Issue Description */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text flex items-center text-lg font-semibold">
                  <Wrench className="mr-2" size={20} />
                  What's the Problem?
                </span>
              </label>
              <textarea
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="textarea textarea-bordered h-32 w-full resize-none"
                placeholder="Describe the issue in detail (e.g., 'My rear brake squeaks when I stop' or 'Chain keeps slipping when I pedal hard')"
                maxLength={500}
              ></textarea>
              <label className="label">
                <span className="label-text-alt">
                  Be specific for better service preparation
                </span>
                <span className="label-text-alt">{issue.length}/500</span>
              </label>
            </div>

            {/* AI Chat Notice */}
            <div className="alert alert-info mb-6">
              <Bot size={16} />
              <div>
                <div className="font-bold">Need a cost estimate?</div>
                <div className="text-sm">
                  Use our AI chat assistant to get instant repair cost estimates
                  and parts recommendations before scheduling your appointment.
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-error mb-6">
                <div>
                  <div className="font-bold">Error</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}

            {/* Time Notice */}
            <div className="alert alert-info mb-6">
              <Clock size={16} />
              <div>
                <div className="font-bold">
                  Service Hours: Monday - Friday, 8:00 AM - 5:00 PM
                </div>
                <div className="text-xs">
                  Same-day bookings available until 5:00 PM
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {!isAuthenticated ? (
              <div className="alert alert-warning mb-6">
                <div>
                  <div className="font-bold">Login Required</div>
                  <div className="text-sm">
                    Please log in to schedule a repair appointment.
                  </div>
                </div>
              </div>
            ) : hasPendingServices ? (
              <div className="alert alert-warning mb-6">
                <div>
                  <div className="font-bold">Service Already Pending</div>
                  <div className="text-sm">
                    You already have a pending service request. Please wait for it to be completed before scheduling another repair.
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!date || !issue.trim() || isSubmitted || isLoading || pendingServicesLoading}
                className={`btn btn-primary w-full ${isSubmitted ? "btn-success" : ""} ${!date || !issue.trim() || pendingServicesLoading ? "btn-disabled" : ""}`}
              >
                {pendingServicesLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Checking...
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Scheduling...
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle size={20} />
                    Repair Scheduled Successfully!
                  </>
                ) : (
                  <>
                    <Calendar size={20} />
                    Schedule Repair
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {isSubmitted && (
          <div className="alert alert-success mt-8">
            <CheckCircle size={20} />
            <div>
              <div className="font-bold">Repair Scheduled Successfully!</div>
              <div className="text-sm">
                Your repair appointment has been scheduled for{" "}
                {date?.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                . We'll contact you to confirm the appointment time.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Repair;
