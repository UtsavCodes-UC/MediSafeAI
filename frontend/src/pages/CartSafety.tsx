import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Plus,
  ShoppingCart,
  Pill,
  ScanSearch,
  CheckCircle,
  Info,
  Loader2,
} from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import interactionData from "@/data/interactions.json";

const severityStyles = {
  High: {
    card:
      "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800",
    text:
      "text-red-700 dark:text-red-300",
    progress: "bg-red-500",
  },

  Medium: {
    card:
      "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-800",
    text:
      "text-yellow-700 dark:text-yellow-300",
    progress: "bg-yellow-500",
  },

  Low: {
    card:
      "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800",
    text:
      "text-green-700 dark:text-green-300",
    progress: "bg-green-500",
  },
};

const initialCart = [
  { id: 1, name: "Warfarin 5mg", qty: 1 },
  { id: 2, name: "Potassium Supplement", qty: 1 },
];

// 🔥 Smart Suggestions from Dataset
const suggestionsList = [
  ...new Set(
    interactionData.flatMap((item) => [
      item.itemA,
      item.itemB,
      ...(item.itemA_synonyms || []),
      ...(item.itemB_synonyms || []),
    ])
  ),
].sort();

const CartSafety = () => {
  const [cart, setCart] = useState(initialCart);

  const [conflicts, setConflicts] = useState<any[]>([]);

  const [input, setInput] = useState("");

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  // 🔥 USER PROFILE
  const personalDetails = JSON.parse(
    localStorage.getItem("personalDetails") || "{}"
  );

  // 🔥 REMOVE ITEM
  const remove = (id: number) => {
    setCart(cart.filter((c) => c.id !== id));

    toast.info("Removed from cart");
  };

  // 🔥 ADD ITEM
  const addItem = (value?: string) => {
    const name = (value || input).trim();

    if (!name) return;

    const exists = cart.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      toast.info("Item already in cart");
      return;
    }

    setCart([
      ...cart,
      {
        id: Date.now(),
        name,
        qty: 1,
      },
    ]);

    toast.success(`${name} added to cart`);

    setInput("");
    setSuggestions([]);
  };

  // 🔥 AUTOCOMPLETE
  const handleInputChange = (value: string) => {
    setInput(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const filtered = suggestionsList
      .filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 8);

    setSuggestions(filtered);
  };

  // 🔥 CLEAN DRUG NAMES
  const extractNames = () => {
    return cart.map((item) =>
      item.name
        .replace(/\d+mg|\d+g|\d+ml/gi, "")
        .trim()
    );
  };

  // 🔥 BACKEND INTERACTION CHECK
  const checkCartInteractions = async () => {
    const items = extractNames();

    if (items.length < 2) {
      setConflicts([]);
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

      const mapped = data.interactions.map(
        (i: any) => {
          const score =
            i.personalizedScore ||
            i.baseScore ||
            0;

          return {
            items: [
              `${i.itemA}`,
              `${i.itemB}`,
            ],

            severity:
              score >= 9
                ? "High"
                : score >= 5
                ? "Medium"
                : "Low",

            score,

            explanation:
              i.mechanism ||
              i.effects?.join(", "),

            aiPreview:
              i.aiExplanation?.[0],

            recommendation:
              i.recommendation ||
              "Consult doctor",

            saferAlternatives:
              i.saferAlternatives || [],
          };
        }
      );

      setConflicts(mapped);

      if (mapped.length > 0) {
        toast.warning(
          `${mapped.length} cart conflict(s) detected`
        );
      }
    } catch (err) {
      console.error("Cart check error:", err);

      toast.error(
        "Failed to analyze cart safety"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCartInteractions();
  }, [cart]);

  // 🔥 OVERALL CART RISK
  const overallRisk =
    conflicts.length === 0
      ? "Safe"
      : conflicts.some(
          (c) => c.severity === "High"
        )
      ? "High"
      : conflicts.some(
          (c) => c.severity === "Medium"
        )
      ? "Moderate"
      : "Low";

  return (
    <Layout>
      <div className="container max-w-6xl py-12">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-bold text-foreground">
              🛒 Smart Cart Safety
            </h1>

            <p className="mt-2 text-muted-foreground">
              Real-time AI-powered medicine cart
              interaction monitoring.
            </p>
          </div>

          {/* RISK BADGE */}
          <div
            className={`rounded-2xl border px-5 py-4 shadow-sm ${
              overallRisk === "High"
                ? "bg-red-50 border-red-200"
                : overallRisk === "Moderate"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
            }`}
          >
            <p className="text-sm text-muted-foreground">
              Overall Cart Safety
            </p>

            <p
              className={`mt-1 text-xl font-bold ${
                overallRisk === "High"
                  ? "text-red-700"
                  : overallRisk === "Moderate"
                  ? "text-yellow-700"
                  : "text-green-700"
              }`}
            >
              {overallRisk}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-8 relative">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) =>
                  handleInputChange(
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addItem()
                }
                placeholder="Add medicine, supplement, food..."
                className="w-full rounded-2xl border bg-background px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />

              {/* SUGGESTIONS */}
              {suggestions.length > 0 && (
                <div className="absolute top-16 left-0 z-20 w-full overflow-hidden rounded-2xl border bg-card shadow-xl">
                  {suggestions.map((s) => (
                    <div
                      key={s}
                      onClick={() =>
                        addItem(s)
                      }
                      className="cursor-pointer px-4 py-3 text-sm transition hover:bg-muted/50"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => addItem()}
              className="rounded-2xl bg-primary px-5 text-white transition hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          {/* CART */}
          <div className="lg:col-span-3 rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />

                <h3 className="text-xl font-semibold">
                  Your Cart
                </h3>
              </div>

              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {cart.length} item(s)
              </div>
            </div>

            {/* ITEMS */}
            <div className="mt-6 space-y-4">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: 10,
                    }}
                    className="group flex items-center justify-between rounded-2xl border bg-background p-4 transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-3">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <p className="font-medium">
                          {item.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Qty: {item.qty}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        remove(item.id)
                      }
                      className="rounded-xl p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {cart.length === 0 && (
                <div className="rounded-2xl border border-dashed py-14 text-center">
                  <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/40" />

                  <p className="mt-3 font-medium">
                    Cart is empty
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Add medicines to begin safety
                    analysis
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SAFETY PANEL */}
          <div className="lg:col-span-2 space-y-5">
            {/* LIVE SCAN */}
            <div className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <ScanSearch className="h-5 w-5 text-primary" />

                <h3 className="font-semibold">
                  Live AI Scan
                </h3>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />

                    <p className="text-sm text-muted-foreground">
                      Checking cart interactions...
                    </p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />

                    <p className="text-sm text-muted-foreground">
                      Cart scanned successfully
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* CONFLICTS */}
            {conflicts.length > 0 ? (
              conflicts.map((c, i) => {
                const style =
                  severityStyles[
                    c.severity as keyof typeof severityStyles
                  ];

                return (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className={`rounded-3xl border p-5 shadow-sm ${style.card}`}
                  >
                    {/* HEADER */}
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-5 w-5 ${style.text}`}
                      />

                      <p
                        className={`font-semibold ${style.text}`}
                      >
                        {c.severity} Risk
                      </p>

                      <div className="ml-auto rounded-full bg-black/10 px-2 py-1 text-xs font-medium">
                        Score: {c.score}
                      </div>
                    </div>

                    {/* ITEMS */}
                    <p className="mt-2 text-sm font-medium">
                      {c.items.join(" + ")}
                    </p>

                    {/* BAR */}
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                      <div
                        className={`h-full ${style.progress}`}
                        style={{
                          width: `${Math.min(
                            c.score * 8,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    {/* EXPLANATION */}
                    <p className="mt-4 text-sm text-foreground/80">
                      {c.explanation?.slice(
                        0,
                        120
                      )}
                      ...
                    </p>

                    {/* AI PREVIEW */}
                    {c.aiPreview && (
                      <div className="mt-3 rounded-xl bg-white/60 dark:bg-white/5 p-3">
                        <p className="text-sm italic text-muted-foreground">
                          🤖 {c.aiPreview}
                        </p>
                      </div>
                    )}

                    {/* RECOMMENDATION */}
                    <div className="mt-4 rounded-xl bg-white/60 dark:bg-white/5 p-3">
                      <p className="text-sm font-medium">
                        💡 {c.recommendation}
                      </p>
                    </div>

                    {/* SAFER ALT */}
                    {c.saferAlternatives
                      ?.length > 0 && (
                      <div className="mt-4 rounded-xl border bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800 p-3">
                        <p className="font-medium text-sm text-green-700">
                          🔄 Safer Alternatives
                        </p>

                        <div className="mt-2 space-y-1">
                          {c.saferAlternatives.map(
                            (
                              alt: any,
                              idx: number
                            ) => (
                              <p
                                key={idx}
                                className="text-xs text-green-700"
                              >
                                <strong>
                                  {alt.original}
                                </strong>{" "}
                                →{" "}
                                {alt.alternatives.join(
                                  ", "
                                )}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
                <ShieldCheck className="mx-auto h-12 w-12 text-green-600" />

                <p className="mt-4 text-xl font-semibold text-green-700">
                  All Clear!
                </p>

                <p className="mt-2 text-sm text-green-700/80">
                  No dangerous interactions detected
                  in your cart.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-10 flex flex-wrap gap-4">
          <button
            onClick={() =>
              toast.success(
                "Proceeding safely with your order!"
              )
            }
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <ShieldCheck className="h-4 w-4" />
            Proceed Safely
          </button>

          <button
            onClick={() =>
              toast.info(
                "Review conflicting items before checkout."
              )
            }
            className="rounded-2xl border px-7 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Review Cart
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CartSafety;