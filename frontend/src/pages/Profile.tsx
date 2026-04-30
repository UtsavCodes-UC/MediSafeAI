import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const conditionsList = ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Kidney Disease", "Liver Disease", "Thyroid Disorder"];
const allergiesList = ["Penicillin", "Sulfa drugs", "Aspirin", "NSAIDs", "Latex", "Iodine", "Codeine"];

const MultiSelect = ({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) => {
  const toggle = (opt: string) => onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              selected.includes(opt) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt}
            {selected.includes(opt) && <X className="ml-1 inline h-3 w-3" />}
          </button>
        ))}
      </div>
    </div>
  );
};

const Profile = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  const save = () => toast.success("Profile saved successfully!");

  return (
    <Layout>
      <div className="container max-w-xl py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Health Profile</h1>
          <p className="mt-2 text-muted-foreground">Your health data helps us personalize risk assessments.</p>

          <div className="mt-8 space-y-6 rounded-xl border bg-card p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 35"
                  className="mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select...</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <MultiSelect label="Existing Conditions" options={conditionsList} selected={conditions} onChange={setConditions} />
            <MultiSelect label="Allergies" options={allergiesList} selected={allergies} onChange={setAllergies} />

            <button
              onClick={save}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4" /> Save Profile
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
