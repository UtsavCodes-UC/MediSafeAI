import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
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
  isEditing,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  isEditing: boolean;
}) => {
  const toggle = (opt: string) =>
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );

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
            disabled={!isEditing}
            onClick={() => toggle(opt)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${selected.includes(opt)
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
const Profile = () => {
  const savedDetails = JSON.parse(
    localStorage.getItem("personalDetails") || "{}"
  );

  const [name, setName] = useState(savedDetails.name || "");
  const [age, setAge] = useState(savedDetails.age || "");
  const [gender, setGender] = useState(savedDetails.gender || "");
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(savedDetails.weight || "");
  const [height, setHeight] = useState(savedDetails.height || "");
  const [conditions, setConditions] = useState<string[]>(
    savedDetails.conditions || []
  );
  const [allergies, setAllergies] = useState<string[]>(
    savedDetails.allergies || []
  );

  const save = () => {
    const updatedProfile = {
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
      JSON.stringify(updatedProfile)
    );

    toast.success("Profile updated successfully!");
  };

  return (
    <Layout>
      <div className="container max-w-xl py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Health Profile</h1>
          <p className="mt-2 text-muted-foreground">Your health data helps us personalize risk assessments.</p>

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
                className="disabled:opacity-70 disabled:cursor-not-allowed mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 35"
                  disabled={!isEditing}
                  className="disabled:opacity-70 disabled:cursor-not-allowed mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={!isEditing}
                  className="disabled:opacity-70 disabled:cursor-not-allowed mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
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
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={!isEditing}
                  className="disabled:opacity-70 disabled:cursor-not-allowed mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Height (cm)
                </label>

                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  disabled={!isEditing}
                  className="disabled:opacity-70 disabled:cursor-not-allowed mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <MultiSelect
              label="Existing Conditions"
              options={conditionsList}
              selected={conditions}
              onChange={setConditions}
              isEditing={isEditing}
            />

            <MultiSelect
              label="Allergies"
              options={allergiesList}
              selected={allergies}
              onChange={setAllergies}
              isEditing={isEditing}
            />
            {isEditing ? (
              <button
                onClick={() => {
                  save();
                  setIsEditing(false);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Edit Profile
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
