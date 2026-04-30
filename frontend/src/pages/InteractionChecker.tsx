import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, AlertTriangle, CheckCircle, Info } from "lucide-react";
import Layout from "@/components/Layout";

const severityConfig = {
  Low: { color: "bg-severity-low/10 text-severity-low border-severity-low/30", icon: CheckCircle },
  Medium: { color: "bg-severity-medium/10 text-severity-medium border-severity-medium/30", icon: Info },
  High: { color: "bg-severity-high/10 text-severity-high border-severity-high/30", icon: AlertTriangle },
} as const;

const suggestionsList = [
  "Paracetamol",
  "Ibuprofen",
  "Aspirin",
  "Alcohol",
  "Warfarin",
  "Metformin",
  "Lisinopril",
  "Vitamin B12",
  "Milk",
  "Antibiotics",
];

const InteractionChecker = () => {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const addItem = (value?: string) => {
    const trimmed = (value || input).trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems([...items, trimmed]);
      setInput("");
      setSuggestions([]);
    }
  };

  const removeItem = (item: string) => setItems(items.filter((i) => i !== item));

  const handleInputChange = (value: string) => {
    setInput(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const filtered = suggestionsList.filter((s) =>
      s.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered);
  };

  const checkInteractions = async () => {
    if (items.length < 2) return;

    try {
      const res = await fetch("http://localhost:5000/api/interactions/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          user: {
            age: 25,
            conditions: [],
          },
        }),
      });

      const data = await res.json();

      localStorage.setItem("checkerItems", JSON.stringify(items));

      const formattedResults = data.interactions.map((interaction: any, index: number) => {
        const score = interaction.personalizedScore || interaction.baseScore || 0;

        let severityLabel = "Low";
        if (score >= 9) severityLabel = "High";
        else if (score >= 5) severityLabel = "Medium";

        return {
          id: index,
          severity: severityLabel,
          score,
          items: [interaction.itemA, interaction.itemB],
          explanation:
            interaction.mechanism ||
            interaction.effects?.join(", "),
          aiPreview: interaction.aiExplanation?.[0],
          action: interaction.recommendation,
        };
      });

      setResults(formattedResults.length === 0 ? [] : formattedResults);

    } catch (error) {
      console.error("Error fetching interactions:", error);
    }
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground">Interaction Checker</h1>
        <p className="mt-2 text-muted-foreground">
          Add medicines, supplements, or foods to check for interactions.
        </p>

        {/* Input Section */}
        <div className="mt-8 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span key={item} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {item}
                <button onClick={() => removeItem(item)} className="ml-1 rounded-full p-0.5 hover:bg-primary/20">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="mt-3 flex gap-2 relative">
            <input
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Type a medicine name and press Enter..."
              className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={() => addItem()} className="rounded-lg border p-2.5 text-muted-foreground hover:bg-muted">
              <Plus className="h-5 w-5" />
            </button>

            {suggestions.length > 0 && (
              <div className="absolute top-12 left-0 w-full rounded-lg border bg-white shadow-md z-10">
                {suggestions.map((s) => (
                  <div
                    key={s}
                    onClick={() => addItem(s)}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-muted"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={checkInteractions}
            disabled={items.length < 2}
            className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Check Interactions
          </button>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {results !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
            >
              <h2 className="font-heading text-xl font-semibold text-foreground">Results</h2>

              {/* Summary Banner */}
              {results.length === 0 ? (
                <div className="rounded-xl border p-5 bg-green-50 text-green-700 text-sm">
                  ✅ No harmful interactions detected. These items are generally safe together.
                </div>
              ) : (
                <div className="rounded-xl border p-4 bg-yellow-50 text-yellow-800 text-sm">
                  ⚠️ {results.length} interaction(s) detected. Review details below.
                </div>
              )}

              {/* Results Cards */}
              {results.map((r) => {
                const cfg = severityConfig[r.severity];
                const Icon = cfg.icon;

                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border p-5 ${cfg.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold">{r.severity} Severity</span>

                      {/* Score Badge */}
                      <span className="ml-auto text-xs px-2 py-1 rounded-full bg-black/10">
                        Score: {r.score}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-2 w-full rounded bg-muted">
                      <div
                        className={`h-2 rounded ${
                          r.severity === "High"
                            ? "bg-red-500"
                            : r.severity === "Medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(r.score * 8, 100)}%` }}
                      />
                    </div>

                    {/* Short Explanation */}
                    <p className="mt-3 text-sm leading-relaxed opacity-90">
                      {r.explanation?.slice(0, 100)}...
                    </p>

                    {/* AI Preview */}
                    {r.aiPreview && (
                      <p className="mt-2 text-sm italic text-muted-foreground">
                        🤖 {r.aiPreview}
                      </p>
                    )}

                    <p className="mt-2 text-sm font-medium">💡 {r.action}</p>

                    {/* View Details */}
                    <Link
                      to="/report"
                      className="text-xs text-primary underline mt-2 inline-block"
                    >
                      View Full Explanation →
                    </Link>
                  </motion.div>
                );
              })}

              <Link
                to="/report"
                className="mt-4 inline-block rounded-lg border border-primary bg-primary/5 px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                View Detailed Report
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default InteractionChecker;