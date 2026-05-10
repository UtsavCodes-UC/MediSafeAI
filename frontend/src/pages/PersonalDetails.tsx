import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const conditionsList = [
    "None",
    "Diabetes",
    "Hypertension",
    "Asthma",
    "Heart Disease",
    "Kidney Disease",
    "Liver Disease",
    "Thyroid Disorder",
];

const allergiesList = [
    "None",
    "Penicillin",
    "Sulfa drugs",
    "Aspirin",
    "NSAIDs",
    "Latex",
    "Iodine",
    "Codeine",
];

const MultiSelect = ({
    label,
    options,
    selected,
    onChange,
}: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (v: string[]) => void;
}) => {
    const toggle = (opt: string) => {
        if (opt === "None") {
            onChange(["None"]);
            return;
        }

        const filtered = selected.filter((s) => s !== "None");

        onChange(
            filtered.includes(opt)
                ? filtered.filter((s) => s !== opt)
                : [...filtered, opt]
        );
    };

    return (
        <div>
            <label className="text-sm font-medium text-foreground">
                {label}
            </label>

            <div className="mt-2 flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${selected.includes(opt)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        {opt}
                        {selected.includes(opt) && (
                            <X className="ml-1 inline h-3 w-3" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

const PersonalDetails = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [conditions, setConditions] = useState<string[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const saveDetails = async () => {
        if (
            !name ||
            !age ||
            !gender ||
            !weight ||
            !height ||
            conditions.length === 0 ||
            allergies.length === 0
        ) {
            toast.error("Please fill all required fields.");
            return;
        }
        setLoading(true);

        const userDetails = {
            name,
            age,
            gender,
            weight,
            height,
            conditions,
            allergies,
        };

        localStorage.setItem(
            "personalDetails",
            JSON.stringify(userDetails)
        );

        setTimeout(() => {
            setLoading(false);

            toast.success("Personal details saved!");

            navigate("/dashboard");
        }, 1200);
    };

    return (
        <Layout>
            <div className="container max-w-xl py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="font-heading text-3xl font-bold text-foreground">
                        Personal Details
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Add your health details for personalized interaction analysis.
                    </p>

                    <div className="mt-8 space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                        <div>
                            <label className="text-sm font-medium text-foreground">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                                required />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-foreground">
                                    Age
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    max="120"
                                    value={age}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);

                                        if (value >= 0 || e.target.value === "") {
                                            setAge(e.target.value);
                                        }
                                    }}
                                    placeholder="e.g. 25"
                                    className="mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    required />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground">
                                    Gender
                                </label>

                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    required
                                    className="mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select...</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-foreground">
                                    Weight (kg)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    max="500"
                                    value={weight}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);

                                        if (value >= 0 || e.target.value === "") {
                                            setWeight(e.target.value);
                                        }
                                    }}
                                    placeholder="e.g. 70"
                                    className="mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground">
                                    Height (cm)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    max="300"
                                    value={height}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);

                                        if (value >= 0 || e.target.value === "") {
                                            setHeight(e.target.value);
                                        }
                                    }}
                                    placeholder="e.g. 175"
                                    className="mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                                    required
                                />
                            </div>
                        </div>

                        <MultiSelect
                            label="Existing Conditions"
                            options={conditionsList}
                            selected={conditions}
                            onChange={setConditions}
                        />

                        <MultiSelect
                            label="Allergies"
                            options={allergiesList}
                            selected={allergies}
                            onChange={setAllergies}
                        />

                        <button
                            onClick={saveDetails}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />

                            {loading ? "Saving..." : "Save & Continue"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default PersonalDetails;