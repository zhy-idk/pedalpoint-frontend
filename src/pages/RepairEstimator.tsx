import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
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
import type { ProductListing } from "../types/product";

interface ListingSummary {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  categorySlug: string;
  slug: string;
  description?: string | null;
}

interface ScoredListing extends ListingSummary {
  score: number;
}

const aiClient = (() => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
})();

const formatPeso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

const normalizePrice = (listing: ProductListing): number => {
  if (listing.price) {
    const parsed = parseFloat(String(listing.price));
    if (!Number.isNaN(parsed)) return parsed;
  }

  const variantPrice = listing.products
    ?.map((variant) => {
      const price =
        typeof variant.price === "number"
          ? variant.price
          : parseFloat(String(variant.price));
      return Number.isNaN(price) ? null : price;
    })
    .filter((price): price is number => price !== null);

  if (variantPrice && variantPrice.length > 0) {
    return Math.min(...variantPrice);
  }

  return 0;
};

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);

function scoreListing(listing: ListingSummary, queryTokens: string[]): number {
  const haystackTokens = new Set([
    ...tokenize(listing.name),
    ...tokenize(listing.categoryName),
    ...(listing.description ? tokenize(listing.description) : []),
  ]);

  let score = 0;
  queryTokens.forEach((token) => {
    if (haystackTokens.has(token)) {
      score += 2;
    } else {
      const match = Array.from(haystackTokens).some((value) =>
        value.startsWith(token.slice(0, 4))
      );
      if (match) {
        score += 1;
      }
    }
  });

  return score;
}

function buildInventoryContext(listings: ScoredListing[]): string {
  if (listings.length === 0) {
    return "No closely matching inventory items were found.";
  }

  return listings
    .map(
      (item) =>
        `- ${item.name} | Category: ${item.categoryName} | Price: ${formatPeso(
          item.price
        )} | Product URL: ${item.categorySlug}/${item.slug}`
    )
    .join("\n");
}

function buildPrompt(options: {
  issue: string;
  bikeType: string;
  ridingStyle: string;
  budget: string;
  inventory: ScoredListing[];
}): string {
  const { issue, bikeType, ridingStyle, budget, inventory } = options;
  const inventoryContext = buildInventoryContext(inventory);

  return `
You are PedalPoint's AI repair estimator. Provide professional but friendly guidance based strictly on the official PedalPoint inventory provided below.

Customer info:
- Bike type: ${bikeType}
- Riding style: ${ridingStyle}
- Budget guidance: ${budget || "Not specified"}
- Reported issue: ${issue}

Inventory items you may recommend (use exact names & prices, do not fabricate): 
${inventoryContext}

Instructions:
1. Give a concise diagnosis (2-3 sentences max).
2. Recommend up to 4 relevant parts. Use bullet points and include part name and ${"price"} from the list above. If nothing matches, state that no exact parts are available and recommend a manual inspection.
3. Provide an estimated total cost range using the recommended parts (include labor estimate of ₱300-600 unless the user says they will DIY).
4. Suggest next steps (booking repair, diagnostic check, etc.).

Formatting: Use Markdown with headings (### Diagnosis, ### Recommended Parts, ### Estimated Cost, ### Next Steps). Keep the response under 180 words.
`;
}

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

const ridingStyles = [
  "Daily commute",
  "Weekend rides",
  "Competitive",
  "Off-road / Trails",
  "Delivery / Cargo",
  "Leisure / Casual",
];

function RepairEstimator() {
  const [issue, setIssue] = useState("");
  const [bikeType, setBikeType] = useState(bikeTypes[0]);
  const [ridingStyle, setRidingStyle] = useState(ridingStyles[0]);
  const [budget, setBudget] = useState("");
  const [inventory, setInventory] = useState<ListingSummary[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [recommendedListings, setRecommendedListings] = useState<ScoredListing[]>(
    []
  );
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchInventory = async () => {
      try {
        setInventoryLoading(true);
        setInventoryError(null);

        const response = await fetch(`${apiBaseUrl}/api/listings/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch inventory (${response.status})`);
        }

        const data: ProductListing[] = await response.json();
        if (!isMounted) return;

        const summaries = data
          .filter((listing) => listing.available !== false)
          .map((listing) => ({
            id: listing.id,
            name: listing.name,
            price: normalizePrice(listing),
            categoryName: listing.category?.name || "General",
            categorySlug: listing.category?.slug || "products",
            slug: listing.slug,
            description: listing.description,
          }))
          .filter((listing) => listing.name && listing.slug);

        setInventory(summaries);
      } catch (error) {
        console.error("Failed to load inventory:", error);
        if (isMounted) {
          setInventoryError(
            error instanceof Error ? error.message : "Failed to load inventory."
          );
        }
      } finally {
        if (isMounted) {
          setInventoryLoading(false);
        }
      }
    };

    fetchInventory();

    return () => {
      isMounted = false;
    };
  }, []);

  const canEstimate = useMemo(
    () =>
      issue.trim().length >= 20 &&
      !inventoryLoading &&
      !inventoryError &&
      !!aiClient,
    [issue, inventoryLoading, inventoryError]
  );

  const handleEstimate = async () => {
    if (!canEstimate || !aiClient) {
      setEstimateError(
        !aiClient
          ? "AI service is not configured. Please contact support."
          : "Please describe the issue in at least 20 characters."
      );
      return;
    }

    setEstimateError(null);
    setIsEstimating(true);

    try {
      const queryTokens = tokenize(issue);
      const scored = inventory
        .map<ScoredListing>((listing) => ({
          ...listing,
          score: scoreListing(listing, queryTokens),
        }))
        .filter((listing) => listing.score > 0 || queryTokens.length === 0)
        .sort((a, b) => b.score - a.score || a.price - b.price)
        .slice(0, 12);

      if (scored.length === 0) {
        scored.push(
          ...inventory
            .slice(0, 6)
            .map((listing) => ({ ...listing, score: 0 }))
        );
      }

      const prompt = buildPrompt({
        issue,
        bikeType,
        ridingStyle,
        budget: budget.trim(),
        inventory: scored,
      });

      const result = await aiClient.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      });

      const responseText = result.text?.trim();
      if (!responseText) {
        throw new Error("AI did not return a response. Please try again.");
      }

      setAiResponse(responseText);
      setRecommendedListings(scored);
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

  const resetEstimator = () => {
    setIssue("");
    setBudget("");
    setBikeType(bikeTypes[0]);
    setRidingStyle(ridingStyles[0]);
    setAiResponse("");
    setRecommendedListings([]);
    setEstimateError(null);
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

        {inventoryError && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Unable to load inventory</p>
              <p className="text-sm">
                {inventoryError}. Try refreshing the page or contact support if
                this persists.
              </p>
            </div>
            <button
              className="btn btn-sm"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        )}

        {!aiClient && (
          <div className="alert alert-warning mb-6">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">AI service not configured</p>
              <p className="text-sm">
                Set the <code>VITE_GEMINI_API_KEY</code> environment variable to
                enable AI-powered repair estimates.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2 text-xl">
                <Wrench size={20} />
                Tell us about the bike issue
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control">
                  <span className="label-text font-semibold">Bike type</span>
                  <select
                    className="select select-bordered"
                    value={bikeType}
                    onChange={(event) => setBikeType(event.target.value)}
                  >
                    {bikeTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text font-semibold">Riding style</span>
                  <select
                    className="select select-bordered"
                    value={ridingStyle}
                    onChange={(event) => setRidingStyle(event.target.value)}
                  >
                    {ridingStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="form-control">
                <span className="label-text font-semibold">
                  Budget guidance (optional)
                </span>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="e.g. I can spend around ₱3,000"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                />
                <span className="label-text-alt text-base-content/70">
                  Mention if you want the most affordable option, premium parts,
                  or a specific price range.
                </span>
              </label>

              <label className="form-control">
                <span className="label-text font-semibold">
                  Describe the symptoms
                </span>
                <textarea
                  className="textarea textarea-bordered h-36 resize-none"
                  placeholder="Include noises, when it happens, affected parts, recent crashes, upgrades, etc."
                  value={issue}
                  onChange={(event) => setIssue(event.target.value)}
                />
                <span className="label-text-alt flex justify-between text-xs text-base-content/60">
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
                  onClick={resetEstimator}
                  disabled={isEstimating}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset form
                </button>
              </div>
              {inventoryLoading && (
                <div className="alert alert-info mt-4 text-xs">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading live inventory data…</span>
                </div>
              )}

              <div className="divider">How it works</div>
              <ol className="space-y-2 text-sm text-base-content/70">
                <li>1. We match your description to parts in stock.</li>
                <li>2. AI suggests the best fix, parts, and cost range.</li>
                <li>3. You can add parts to cart or schedule a repair.</li>
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
                    const link = `/${listing.categorySlug}/${listing.slug}`;
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
                              {listing.categoryName}
                            </p>
                          </div>
                          <span className="badge badge-outline">
                            Score {Math.max(0, listing.score)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="font-semibold">
                            {listing.price > 0
                              ? formatPeso(listing.price)
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

        {!aiResponse && !inventoryLoading && (
          <div className="mt-10 rounded-lg bg-base-100 p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Live inventory coverage</h3>
            <p className="text-sm text-base-content/70 mt-1">
              We currently track{" "}
              <span className="font-semibold">{inventory.length}</span> service
              parts, consumables, and upgrade components for accurate estimates.
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

