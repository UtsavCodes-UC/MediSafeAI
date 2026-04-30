import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldCheck, Trash2, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const initialCart = [
  { id: 1, name: "Warfarin 5mg", qty: 1 },
  { id: 2, name: "Potassium Supplement", qty: 1 },
];

// 🔍 Suggestions list
const suggestionsList = [
  "Paracetamol 500mg",
  "Ibuprofen 400mg",
  "Aspirin 325mg",
  "Warfarin 5mg",
  "Metformin 500mg",
  "Lisinopril 10mg",
  "Atorvastatin 20mg",
  "Amoxicillin 250mg",
  "Vitamin B12",
  "Potassium Supplement",
];

const CartSafety = () => {
  const [cart, setCart] = useState(initialCart);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const remove = (id: number) => setCart(cart.filter((c) => c.id !== id));

  // 🔥 Add item
  const addItem = (value?: string) => {
    const name = (value || input).trim();
    if (!name) return;

    const exists = cart.find((c) => c.name === name);
    if (exists) {
      toast.info("Item already in cart");
      return;
    }

    setCart([...cart, { id: Date.now(), name, qty: 1 }]);
    setInput("");
    setSuggestions([]);
  };

  // 🔍 Handle autocomplete
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

  // 🔥 Extract clean drug names
  const extractNames = () => {
    return cart.map((item) =>
      item.name.replace(/\d+mg|\d+g|\d+ml/gi, "").trim()
    );
  };

  // 🔥 Fetch interactions
  const checkCartInteractions = async () => {
    const items = extractNames();

    if (items.length < 2) {
      setConflicts([]);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      const mapped = data.interactions.map((i: any) => ({
        items: [`${i.itemA}`, `${i.itemB}`],
        severity:
          i.severity === "high"
            ? "High"
            : i.severity === "medium"
            ? "Medium"
            : "Low",
        explanation: i.mechanism || i.effects?.join(", "),
        alternative: i.recommendation || "Consult doctor",
      }));

      setConflicts(mapped);
    } catch (err) {
      console.error("Cart check error:", err);
    }
  };

  useEffect(() => {
    checkCartInteractions();
  }, [cart]);

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground">Cart Safety Check</h1>
        <p className="mt-2 text-muted-foreground">We automatically scan your medicine cart for dangerous interactions.</p>

        {/* 🔍 Search Bar */}
        <div className="mt-6 relative">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Add medicine to the cart..."
              className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => addItem()}
              className="rounded-lg border p-2.5 text-muted-foreground hover:bg-muted"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Suggestions */}
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

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          {/* Cart */}
          <div className="lg:col-span-3 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-heading text-lg font-semibold text-card-foreground">Your Cart</h3>
            <div className="mt-4 space-y-3">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Qty: {item.qty}</span>
                      <button onClick={() => remove(item.id)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {cart.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Cart is empty</p>}
            </div>
          </div>

          {/* Status */}
          <div className="lg:col-span-2 space-y-4">
            {conflicts.length > 0 ? (
              conflicts.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-5 ${
                    c.severity === "High"
                      ? "bg-severity-high/10 border-severity-high/30"
                      : c.severity === "Medium"
                      ? "bg-severity-medium/10 border-severity-medium/30"
                      : "bg-severity-low/10 border-severity-low/30"
                  }`}
                >
                  <div className={`flex items-center gap-2 font-semibold ${
                    c.severity === "High"
                      ? "text-severity-high"
                      : c.severity === "Medium"
                      ? "text-severity-medium"
                      : "text-severity-low"
                  }`}>
                    <AlertTriangle className="h-5 w-5" />
                    {c.severity} Risk
                  </div>
                  <p className="mt-1 text-xs font-medium">{c.items.join(" + ")}</p>
                  <p className="mt-2 text-sm text-foreground/80">{c.explanation}</p>
                  <p className="mt-2 text-sm font-medium text-accent">✅ {c.alternative}</p>
                </motion.div>
              ))
            ) : (
              <div className="rounded-xl border bg-secondary p-5 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-accent" />
                <p className="mt-2 font-semibold text-secondary-foreground">All Clear!</p>
                <p className="text-sm text-muted-foreground">No conflicts detected in your cart.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => toast.success("Proceeding safely with your order!")}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          >
            <ShieldCheck className="h-4 w-4" /> Proceed Safely
          </button>
          <button
            onClick={() => toast.info("Review your cart and remove conflicting items.")}
            className="rounded-lg border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Modify Cart
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CartSafety;