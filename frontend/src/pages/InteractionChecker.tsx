import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  AlertTriangle,
  CheckCircle,
  Info,
  User,
} from "lucide-react";
import Layout from "@/components/Layout";
import interactionData from "@/data/interactions.json";
import { toast } from "sonner";

const severityConfig = {
  Low: {
    color:
      "bg-severity-low/10 text-severity-low border-severity-low/30",
    icon: CheckCircle,
  },
  Medium: {
    color:
      "bg-severity-medium/10 text-severity-medium border-severity-medium/30",
    icon: Info,
  },
  High: {
    color:
      "bg-severity-high/10 text-severity-high border-severity-high/30",
    icon: AlertTriangle,
  },
} as const;

const suggestionsList = [
  ...new Set(
    interactionData.flatMap((item) => [
      item.itemA,
      item.itemB,
      ...(item.itemA_synonyms || []),
      ...(item.itemB_synonyms || []),
    ])
  ),
];

const InteractionChecker = () => {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch Personal Details from localStorage
  const personalDetails = JSON.parse(
    localStorage.getItem("personalDetails") || "{}"
  );

  const addItem = (value?: string) => {
    const trimmed = (value || input).trim();

    if (trimmed && !items.includes(trimmed)) {
      setItems([...items, trimmed]);
      setInput("");
      setSuggestions([]);
    }
  };

  const removeItem = (item: string) =>
    setItems(items.filter((i) => i !== item));

  const handleInputChange = (value: string) => {
    setInput(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const filtered = suggestionsList.filter((s) =>
      s.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 8));
  };

  console.log(personalDetails.age);

  const checkInteractions = async () => {
    if (items.length < 2) {
      toast.error("Please add at least 2 items.");
      return;
    }

    // 🔥 Ensure personal details exist
    if (!personalDetails?.age) {
      toast.error(
        "Please complete your Health Profile first for personalized analysis."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/interactions/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          // 🔥 PERSONALIZED USER DATA SENT TO BACKEND
          body: JSON.stringify({
            items,
            user: {
              age: Number(personalDetails.age),
              gender: personalDetails.gender,
              weight: Number(personalDetails.weight),
              height: Number(personalDetails.height),

              conditions:
                personalDetails.conditions?.filter(
                  (c: string) => c !== "None"
                ) || [],

              allergies:
                personalDetails.allergies?.filter(
                  (a: string) => a !== "None"
                ) || [],
            },
          }),
        }
      );

      const data = await res.json();

      // 🔥 Store for Report Page
      localStorage.setItem("checkerItems", JSON.stringify(items));
      localStorage.setItem(
        "interactionResults",
        JSON.stringify(data.interactions)
      );

      const formattedResults = data.interactions.map(
        (interaction: any, index: number) => {
          const score =
            interaction.personalizedScore ||
            interaction.baseScore ||
            0;

          let severityLabel = "Low";

          if (score >= 9) severityLabel = "High";
          else if (score >= 5) severityLabel = "Medium";

          return {
            id: index,

            severity: severityLabel,

            // 🔥 Personalized Score
            score,

            baseScore: interaction.baseScore || 0,

            items: [interaction.itemA, interaction.itemB],

            explanation:
              interaction.mechanism ||
              interaction.effects?.join(", "),

            aiPreview: interaction.aiExplanation?.[0],

            action: interaction.recommendation,

            // 🔥 Extra personalization info
            triggeredBy:
              interaction.riskFactors
                ?.filter((r: any) =>
                  personalDetails.conditions?.includes(
                    r.condition
                  )
                )
                .map((r: any) => r.condition) || [],
          };
        }
      );


      setResults(
        formattedResults.length === 0
          ? []
          : formattedResults
      );

      if (formattedResults.length > 0) {
        toast.warning(
          `${formattedResults.length} interaction(s) detected`
        );
      } else {
        toast.success("No harmful interactions detected");
      }
    } catch (error) {
      console.error("Error fetching interactions:", error);

      toast.error("Failed to check interactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Interaction Checker
            </h1>

            <p className="mt-2 text-muted-foreground">
              Analyze medicines, supplements, foods, and drinks
              for potential health risks.
            </p>
          </div>

          {/* 🔥 PERSONALIZATION BADGE */}
          <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 shadow-sm">
            <User className="h-5 w-5 text-primary" />

            <div className="text-sm">
              <p className="font-semibold">
                {personalDetails.name || "Guest User"}
              </p>

              <p className="text-muted-foreground">
                Personalized Analysis Enabled
              </p>
            </div>
          </div>
        </div>

        {/* INPUT SECTION */}
        <div className="mt-8 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {item}

                <button
                  onClick={() => removeItem(item)}
                  className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          {/* INPUT */}
          <div className="mt-4 flex gap-2 relative">
            <input
              value={input}
              onChange={(e) =>
                handleInputChange(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" && addItem()
              }
              placeholder="Type medicine, food, or drink..."
              className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <button
              onClick={() => addItem()}
              className="rounded-xl border p-3 text-muted-foreground transition hover:bg-muted"
            >
              <Plus className="h-5 w-5" />
            </button>

            {/* SUGGESTIONS */}
            {suggestions.length > 0 && (
              <div className="absolute top-14 left-0 w-full rounded-xl border bg-card shadow-lg z-20 overflow-hidden">
                {suggestions.map((s) => (
                  <div
                    key={s}
                    onClick={() => addItem(s)}
                    className="cursor-pointer px-4 py-3 text-sm hover:bg-muted/50"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BUTTON */}
          <button
            onClick={checkInteractions}
            disabled={items.length < 2 || loading}
            className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Running Personalized Analysis...
              </span>
            ) : (
              "Check Interactions"
            )}
          </button>
        </div>

        {/* RESULTS */}
        <AnimatePresence>
          {results !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-semibold">
                  Results
                </h2>

                {results.length > 0 && (
                  <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                    {results.length} Risk Detected
                  </div>
                )}
              </div>

              {/* SUMMARY */}
              {results.length === 0 ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-700 shadow-sm">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    No harmful interactions detected
                  </div>

                  <p className="mt-2 text-sm opacity-90">
                    These items appear generally safe together
                    based on your profile.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800 shadow-sm">
                  ⚠️ Personalized analysis detected{" "}
                  <strong>{results.length}</strong> potential
                  interaction(s).
                </div>
              )}

              {/* RESULT CARDS */}
              {results.map((r) => {
                const cfg = severityConfig[r.severity];
                const Icon = cfg.icon;

                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${cfg.color}`}
                  >
                    {/* HEADER */}
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-black/10 p-2">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-semibold">
                          {r.severity} Severity
                        </p>

                        <p className="text-sm opacity-80">
                          {r.items.join(" + ")}
                        </p>
                      </div>

                      {/* SCORE */}
                      <div className="ml-auto text-right">
                        <p className="text-xs opacity-70">
                          Personalized Score
                        </p>

                        <p className="text-2xl font-bold">
                          {r.score}
                        </p>
                      </div>
                    </div>

                    {/* SCORE BAR */}
                    <div className="mt-4 h-2 w-full rounded-full bg-black/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${r.severity === "High"
                          ? "bg-red-500"
                          : r.severity === "Medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                          }`}
                        style={{
                          width: `${Math.min(
                            r.score * 8,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    {/* PERSONALIZATION */}
                    {r.triggeredBy.length > 0 && (
                      <div className="mt-3 rounded-xl bg-black/5 p-3 text-sm">
                        🧠 Higher risk detected due to:
                        <span className="ml-1 font-medium">
                          {r.triggeredBy.join(", ")}
                        </span>
                      </div>
                    )}

                    {/* EXPLANATION */}
                    <p className="mt-4 text-sm leading-relaxed opacity-90">
                      {r.explanation?.slice(0, 140)}...
                    </p>

                    {/* AI PREVIEW */}
                    {r.aiPreview && (
                      <div className="mt-3 rounded-xl border bg-background/60 p-3">
                        <p className="text-sm italic text-muted-foreground">
                          🤖 {r.aiPreview}
                        </p>
                      </div>
                    )}

                    {/* RECOMMENDATION */}
                    <div className="mt-4 rounded-xl bg-black/5 p-3 text-sm font-medium">
                      💡 {r.action}
                    </div>

                    {/* DETAILS */}
                    <Link
                      to="/report"
                      className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      View Full Detailed Report →
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default InteractionChecker;