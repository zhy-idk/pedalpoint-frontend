import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Bot,
  ClipboardList,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Sparkles,
  Wrench,
} from "lucide-react";
import { apiBaseUrl } from "../api";
import { getCSRFToken } from "../utils/csrf";

const bikeTypes = [
  "Mountain",
  "Road",
  "Hybrid",
  "BMX",
  "Gravel",
  "Folding",
  "E-Bike",
  "Kids",
];

function RepairEstimator() {
  const [issue, setIssue] = useState("");
  const [bikeType, setBikeType] = useState(bikeTypes[0]);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [recommendedListings, setRecommendedListings] = useState<
    Array<{
      id: number;
      name: string;
      price: number;
      category: string;
      category_slug: string;
      slug: string;
      score: number;
    }>
  >([]);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const canEstimate =
    issue.trim().length >= 20 && !isEstimating && !authRequired && !isLoadingSaved;

  const fetchExistingEstimate = async () => {
    setIsLoadingSaved(true);
    setEstimateError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/repair-estimator/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        setAuthRequired(true);
        setEstimateError("Please log in to use the repair estimator.");
        setIssue("");
        setBikeType(bikeTypes[0]);
        setAiResponse("");
        setRecommendedListings([]);
        setUpdatedAt(null);
        return;
      }

      if (response.status === 404) {
        setIssue("");
        setBikeType(bikeTypes[0]);
        setAiResponse("");
        setRecommendedListings([]);
        setUpdatedAt(null);
        setAuthRequired(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load saved estimate.");
      }

      setIssue(data.issue || "");
      setBikeType(data.bike_type || bikeTypes[0]);
      setAiResponse(data.ai_summary || "");
      setRecommendedListings(data.recommendations || []);
      setUpdatedAt(data.updated_at || null);
      setAuthRequired(false);
    } catch (error) {
      console.error("Failed to load estimate:", error);
      setEstimateError(
        error instanceof Error
          ? error.message
          : "Unable to load your saved estimate. Please try again."
      );
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    fetchExistingEstimate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEstimate = async () => {
    if (!canEstimate) {
      setEstimateError(
        authRequired
          ? "Log in to PedalPoint so we can save your repair estimates."
          : "Please describe the issue in at least 20 characters."
      );
      return;
    }

    setEstimateError(null);
    setIsEstimating(true);

    try {
      setAuthRequired(false);
      const csrfToken = getCSRFToken();
      const response = await fetch(`${apiBaseUrl}/api/repair-estimator/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          issue: issue.trim(),
          bike_type: bikeType,
        }),
      });

      if (response.status === 401) {
        setAuthRequired(true);
        throw new Error("Please log in to use the repair estimator.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate estimate.");
      }

      setIssue(data.issue || issue);
      setBikeType(data.bike_type || bikeType);
      setAiResponse(data.ai_summary || "");
      setRecommendedListings(data.recommendations || []);
      setUpdatedAt(data.updated_at || null);
    } catch (error) {
      console.error("Failed to generate estimate:", error);
      setEstimateError(
        error instanceof Error
          ? error.message
          : "We couldn't generate an estimate. Please try again."
      );
    } finally {
      setIsEstimating(false);
    }
  };

  const handleReset = async () => {
    setEstimateError(null);
    setIsEstimating(true);
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`${apiBaseUrl}/api/repair-estimator/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        credentials: "include",
      });

      if (response.status === 401) {
        setAuthRequired(true);
        throw new Error("Please log in to remove your saved estimate.");
      }

      if (response.status !== 200 && response.status !== 204 && response.status !== 404) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to reset saved estimate.");
      }

      setIssue("");
      setBikeType(bikeTypes[0]);
      setAiResponse("");
      setRecommendedListings([]);
      setEstimateError(null);
      setUpdatedAt(null);
      setAuthRequired(false);
    } catch (error) {
      console.error("Failed to reset estimate:", error);
      setEstimateError(
        error instanceof Error
          ? error.message
          : "We couldn't reset the estimate. Please try again."
      );
    } finally {
      setIsEstimating(false);
    }
  };

  const renderAiResponse = (text: string): ReactNode[] => {
    const lines = text.split("\n");
    const elements: ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = () => {
      if (currentList.length === 0) return;
      elements.push(
        <ul className="list-disc space-y-1 pl-4" key={`list-${elements.length}`}>
          {currentList.map((item, index) => (
            <li key={index}>{item.replace(/^-+\s*/, "")}</li>
          ))}
        </ul>
      );
      currentList = [];
    };

    lines.forEach((rawLine, index) => {
      const line = rawLine.trim();

      if (!line) {
        flushList();
        if (
          elements.length > 0 &&
          typeof elements[elements.length - 1] !== "string"
        ) {
          elements.push(<div key={`spacer-${index}`} className="h-3" />);
        }
        return;
      }

      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={`heading-${index}`} className="text-lg font-semibold text-base-content">
            {line.replace("### ", "").trim()}
          </h3>
        );
        return;
      }

      if (line.startsWith("- ")) {
        currentList.push(line);
        return;
      }

      flushList();
      elements.push(
        <p key={`paragraph-${index}`} className="text-sm leading-relaxed text-base-content/80">
          {line}
        </p>
      );
    });

    flushList();
    return elements;
  };

  return (
    <div className="bg-base-200 min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="badge badge-primary badge-lg mb-4 gap-2">
            <Sparkles size={16} />
            AI Powered
          </div>
          <h1 className="text-4xl font-bold text-base-content">
            Repair Estimator
          </h1>
          <p className="text-base-content/70 mx-auto mt-3 max-w-2xl">
            Describe your bike issue and let our AI recommend the right repair
            parts from PedalPoint's live catalog. Get upfront cost guidance before
            booking a service.
          </p>
        </div>

        {isLoadingSaved && !authRequired && (
          <div className="alert alert-info mb-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading your saved repair estimate…</span>
          </div>
        )}

        {authRequired && (
          <div className="alert alert-warning mb-6 items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div className="flex-1 text-left">
              <p className="font-semibold">Log in to use the repair estimator</p>
              <p className="text-sm text-base-content/70">
                Sign in so we can store repair suggestions for you and sync them across devices.
              </p>
            </div>
            <Link to="/login" className="btn btn-sm btn-primary">
              Log in
            </Link>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2 text-xl">
                <Wrench size={20} />
                Tell us about the bike issue
              </h2>

              <label className="form-control w-full">
                <span className="label-text font-semibold mb-1 inline-block">
                  Bike type
                </span>
                <select
                  className="select select-bordered w-full"
                  value={bikeType}
                  onChange={(event) => setBikeType(event.target.value)}
                  disabled={isEstimating || authRequired || isLoadingSaved}
                >
                  {bikeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control w-full">
                <span className="label-text font-semibold mb-1 inline-block">
                  Describe the symptoms
                </span>
                <textarea
                  className="textarea textarea-bordered h-36 w-full resize-none"
                  placeholder="Include noises, when it happens, affected parts, recent crashes, upgrades, etc."
                  value={issue}
                  onChange={(event) => setIssue(event.target.value)}
                  disabled={isEstimating || authRequired || isLoadingSaved}
                />
                <span className="label-text-alt flex justify-between text-xs text-base-content/60 mt-1">
                  <span>Minimum 20 characters for accurate results.</span>
                  <span>{issue.length}/500</span>
                </span>
              </label>

              {estimateError && (
                <div className="alert alert-warning">
                  <AlertCircle className="h-5 w-5" />
                  <span>{estimateError}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  className="btn btn-primary"
                  onClick={handleEstimate}
                  disabled={!canEstimate || isEstimating}
                >
                  {isEstimating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating estimate...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                      Get AI estimate
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleReset}
                  disabled={isEstimating || authRequired || isLoadingSaved}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset form
                </button>
              </div>

              <div className="divider">How it works</div>
              <ol className="space-y-2 text-sm text-base-content/70">
                <li>1. We match your description to parts in stock.</li>
                <li>2. AI suggests the best fix, parts, and cost range.</li>
                <li>3. We save the estimate so you can revisit it anytime.</li>
                <li>4. Add parts to cart or schedule a repair when you&apos;re ready.</li>
              </ol>
            </div>
          </div>

          <div className="card bg-info/10 border border-info shadow-lg">
            <div className="card-body">
              <h3 className="font-semibold text-info text-lg">
                Why use the estimator?
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-info/90">
                <li>• Faster than manual price checks</li>
                <li>• Uses PedalPoint's live inventory data</li>
                <li>• Gives cost transparency before booking</li>
                <li>• Suggests compatible parts with current pricing</li>
              </ul>
              <div className="alert alert-info mt-6 text-xs leading-relaxed">
                <ClipboardList className="h-4 w-4" />
                <span>
                  Estimates are informational and assume standard labor (₱300-600).
                  Final diagnosis happens in-store after a full inspection.
                </span>
              </div>
            </div>
          </div>
        </div>

        {isEstimating && (
          <div className="alert alert-info mt-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>We&apos;re matching your issue with current inventory...</span>
          </div>
        )}

        {aiResponse && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[3fr,2fr]">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title flex items-center gap-2 text-xl">
                  <Bot size={20} />
                  AI Repair Estimate
                </h2>
                {updatedAt && (
                  <p className="text-xs text-base-content/60">
                    Last updated:{" "}
                    {new Date(updatedAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                <div className="space-y-2">
                  {renderAiResponse(aiResponse)}
                </div>
                <div className="alert alert-info mt-4 text-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>
                    Save or print this estimate to discuss with a PedalPoint
                    technician. Parts availability updates frequently—add parts to
                    your cart to reserve them.
                  </span>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">Recommended parts</h3>
                {recommendedListings.length === 0 && (
                  <p className="text-sm text-base-content/70">
                    No matching parts found in current inventory. Try rephrasing the
                    issue or contact our staff for a manual review.
                  </p>
                )}
                <div className="mt-4 space-y-3">
                  {recommendedListings.map((listing) => {
                    const link = `/${listing.category_slug}/${listing.slug}`;
                    return (
                      <div
                        key={listing.id}
                        className="border-base-200 rounded-lg border p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold leading-tight">
                              {listing.name}
                            </h4>
                            <p className="text-xs text-base-content/60">
                              {listing.category}
                            </p>
                          </div>
                          <span className="badge badge-outline">
                            Score {Math.max(0, listing.score)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="font-semibold">
                            {listing.price > 0
                              ? new Intl.NumberFormat("en-PH", {
                                  style: "currency",
                                  currency: "PHP",
                                  maximumFractionDigits:
                                    listing.price % 1 === 0 ? 0 : 2,
                                }).format(listing.price)
                              : "See product page"}
                          </span>
                          <Link to={link} className="btn btn-xs btn-primary">
                            View part
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {!aiResponse && !isEstimating && (
          <div className="mt-10 rounded-lg bg-base-100 p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Live inventory coverage</h3>
            <p className="text-sm text-base-content/70 mt-1">
              Recommendations are generated from PedalPoint&apos;s product
              catalog in real time, so prices and availability stay accurate.
            </p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-base-200 rounded-lg p-3">
                <p className="font-semibold">Popular categories</p>
                <p className="text-xs text-base-content/60">
                  Brakes, drivetrain, tires, bearings, cockpit components, and more.
                </p>
              </div>
              <div className="bg-base-200 rounded-lg p-3">
                <p className="font-semibold">Real-time pricing</p>
                <p className="text-xs text-base-content/60">
                  Estimates reflect current pricing from the PedalPoint catalog.
                </p>
              </div>
              <div className="bg-base-200 rounded-lg p-3">
                <p className="font-semibold">Service-ready</p>
                <p className="text-xs text-base-content/60">
                  Recommendations factor in typical labor charges and compatibility.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RepairEstimator;

