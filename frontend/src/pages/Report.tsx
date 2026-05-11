import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileDown,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Info,
  User,
  ShieldAlert,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { toast } from "sonner";

const Report = () => {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const storedItems = JSON.parse(
          localStorage.getItem("checkerItems") || "[]"
        );

        // 🔥 PERSONAL DETAILS
        const personalDetails = JSON.parse(
          localStorage.getItem("personalDetails") || "{}"
        );

        if (!storedItems || storedItems.length < 2) return;

        const res = await fetch(
          "http://localhost:5000/api/interactions/check",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },

            // 🔥 SEND PERSONALIZED DATA
            body: JSON.stringify({
              items: storedItems,

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

        let totalScore = 0;

        const findings = data.interactions.map((i: any) => {
          const score =
            i.personalizedScore || i.baseScore || 0;

          totalScore += score;

          return {
            severity:
              score >= 9
                ? "High"
                : score >= 5
                ? "Medium"
                : "Low",

            pair: `${i.itemA} + ${i.itemB}`,

            score,

            baseScore: i.baseScore,

            personalizedScore:
              i.personalizedScore || i.baseScore,

            detail:
              i.mechanism || i.effects?.join(", "),

            aiExplanation:
              i.aiExplanation || [],

            recommendation:
              i.recommendation,

            saferAlternatives:
              i.saferAlternatives || [],

            // 🔥 PERSONALIZATION TRIGGERS
            triggeredBy:
              i.riskFactors
                ?.filter((r: any) =>
                  personalDetails.conditions?.includes(
                    r.condition
                  )
                )
                .map((r: any) => r.condition) || [],
          };
        });

        // 🔥 NORMALIZE OVERALL SCORE
        totalScore = Math.min(totalScore * 5, 100);

        const recommendations =
          data.interactions.map(
            (i: any) => i.recommendation
          );

        setReport({
          user: personalDetails,

          items: storedItems,

          riskScore: totalScore,

          findings,

          recommendations,
        });
      } catch (err) {
        console.error("Error loading report:", err);

        toast.error(
          "Failed to load personalized report"
        );
      }
    };

    fetchReport();
  }, []);

  const generateSummary = () => {
    if (!report) return "";

    if (report.riskScore >= 70)
      return "⚠️ High-risk personalized interactions detected. Immediate medical consultation is strongly advised.";

    if (report.riskScore >= 40)
      return "⚠️ Moderate-risk interactions detected. Monitor usage carefully and avoid unsafe combinations.";

    if (report.riskScore > 0)
      return "ℹ️ Minor interactions detected. Generally manageable with precautions.";

    return "✅ No significant interactions detected based on your health profile.";
  };

  // 🔥 PDF DOWNLOAD
  const downloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();

    let y = 12;

    doc.setFontSize(20);
    doc.text("MediSafe AI - Personalized Report", 10, y);

    y += 12;

    doc.setFontSize(12);

    doc.text(
      `Patient: ${report.user.name || "User"}`,
      10,
      y
    );

    y += 7;

    doc.text(
      `Age: ${report.user.age || "-"}`,
      10,
      y
    );

    y += 7;

    doc.text(
      `Conditions: ${
        report.user.conditions?.join(", ") || "None"
      }`,
      10,
      y
    );

    y += 10;

    doc.text(generateSummary(), 10, y);

    y += 10;

    doc.text(
      `Overall Risk Score: ${report.riskScore}/100`,
      10,
      y
    );

    y += 14;

    report.findings.forEach((f: any) => {
      doc.setFontSize(13);

      doc.text(
        `${f.severity} - ${f.pair}`,
        10,
        y
      );

      y += 7;

      doc.setFontSize(11);

      const splitText = doc.splitTextToSize(
        f.detail,
        180
      );

      doc.text(splitText, 10, y);

      y += splitText.length * 6;

      if (f.aiExplanation?.length > 0) {
        f.aiExplanation.forEach((point: string) => {
          const bullet = `• ${point}`;

          const splitBullet =
            doc.splitTextToSize(
              bullet,
              180
            );

          doc.text(splitBullet, 12, y);

          y += splitBullet.length * 6;
        });
      }

      y += 8;

      if (y > 260) {
        doc.addPage();

        y = 12;
      }
    });

    doc.save("medisafe-report.pdf");
  };

  if (!report) return null;

  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        {/* BACK */}
        <Link
          to="/checker"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Checker
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          {/* HEADER */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">
                🧠 Personalized Risk Report
              </h1>

              <p className="mt-2 text-muted-foreground">
                AI-powered interaction analysis tailored
                to your health profile.
              </p>
            </div>

            {/* USER CARD */}
            <div className="rounded-2xl border bg-card px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <User className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="font-semibold">
                    {report.user.name ||
                      "Anonymous User"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {report.user.age || "-"} yrs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="mt-6 rounded-2xl border bg-muted/40 p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-5 w-5 text-primary" />
              AI Summary
            </div>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {generateSummary()}
            </p>
          </div>

          {/* RISK SCORE */}
          <div className="mt-8 rounded-2xl border bg-card p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Overall Personalized Risk Score
                </p>

                <p className="mt-2 text-5xl font-extrabold">
                  {report.riskScore}
                </p>
              </div>

              <div
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  report.riskScore >= 70
                    ? "bg-red-100 text-red-700"
                    : report.riskScore >= 40
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {report.riskScore >= 70
                  ? "High Risk"
                  : report.riskScore >= 40
                  ? "Moderate Risk"
                  : "Low Risk"}
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  report.riskScore >= 70
                    ? "bg-red-500"
                    : report.riskScore >= 40
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${report.riskScore}%`,
                }}
              />
            </div>
          </div>

          {/* PROFILE IMPACT */}
          <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              Personalization Factors
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Existing Conditions
                </p>

                <p className="mt-1 font-medium">
                  {report.user.conditions?.length > 0
                    ? report.user.conditions.join(", ")
                    : "None"}
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Allergies
                </p>

                <p className="mt-1 font-medium">
                  {report.user.allergies?.length > 0
                    ? report.user.allergies.join(", ")
                    : "None"}
                </p>
              </div>
            </div>
          </div>

          {/* INTERACTION ANALYSIS */}
          <h2 className="mt-10 text-2xl font-semibold">
            Interaction Analysis
          </h2>

          <div className="mt-5 space-y-5">
            {report.findings.map((f: any) => {
              const Icon =
                f.severity === "High"
                  ? AlertTriangle
                  : f.severity === "Medium"
                  ? Info
                  : CheckCircle;

              return (
                <motion.div
                  key={f.pair}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-2xl border bg-card p-6 shadow-sm"
                >
                  {/* HEADER */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        f.severity === "High"
                          ? "bg-red-100 text-red-600"
                          : f.severity === "Medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {f.severity} Severity
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {f.pair}
                      </p>
                    </div>

                    <div className="ml-auto text-right">
                      <p className="text-xs text-muted-foreground">
                        Personalized Score
                      </p>

                      <p className="text-2xl font-bold">
                        {f.score}
                      </p>
                    </div>
                  </div>

                  {/* BAR */}
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        f.severity === "High"
                          ? "bg-red-500"
                          : f.severity === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          f.score * 8,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  {/* PERSONALIZATION */}
                  {f.triggeredBy.length > 0 && (
                    <div className="mt-4 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
                      🧠 Elevated risk detected due to:
                      <span className="ml-1 font-semibold">
                        {f.triggeredBy.join(", ")}
                      </span>
                    </div>
                  )}

                  {/* DETAIL */}
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {f.detail}
                  </p>

                  {/* AI EXPLANATION */}
                  {f.aiExplanation.length > 0 && (
                    <div className="mt-5 rounded-xl border bg-muted/30 p-4">
                      <p className="font-medium">
                        🤖 AI Explanation
                      </p>

                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {f.aiExplanation.map(
                          (
                            point: string,
                            i: number
                          ) => (
                            <li
                              key={i}
                              className="flex gap-2"
                            >
                              <span>•</span>
                              <span>{point}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* RISK BREAKDOWN */}
                  <div className="mt-5 rounded-xl bg-black/5 p-4 text-sm">
                    <p className="font-medium">
                      📊 Risk Breakdown
                    </p>

                    <div className="mt-2 flex items-center justify-between text-muted-foreground">
                      <span>Base Score</span>

                      <span>{f.baseScore}</span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-muted-foreground">
                      <span>
                        Personalization Impact
                      </span>

                      <span>
                        +
                        {f.personalizedScore -
                          f.baseScore}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between font-semibold">
                      <span>Final Score</span>

                      <span>{f.personalizedScore}</span>
                    </div>
                  </div>

                  {/* SAFER ALTERNATIVES */}
                  {f.saferAlternatives?.length >
                    0 && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                      <p className="font-medium text-green-800">
                        🔄 Safer Alternatives
                      </p>

                      <div className="mt-3 space-y-2">
                        {f.saferAlternatives.map(
                          (
                            alt: any,
                            idx: number
                          ) => (
                            <div
                              key={idx}
                              className="text-sm text-green-700"
                            >
                              <strong>
                                {alt.original}
                              </strong>{" "}
                              →{" "}
                              {alt.alternatives.join(
                                ", "
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* RECOMMENDATION */}
                  <div className="mt-5 rounded-xl bg-primary/5 p-4 text-sm font-medium">
                    💡 {f.recommendation}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* RECOMMENDATIONS */}
          <div className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">
              Recommendations
            </h2>

            <ul className="mt-4 space-y-3">
              {report.recommendations.map(
                (rec: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm"
                  >
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* ACTIONS */}
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </button>

            <Link
              to="/checker"
              className="rounded-xl border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
            >
              Back
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Report;