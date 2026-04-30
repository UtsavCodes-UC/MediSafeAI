// UPDATED REPORT PAGE (NEXT-LEVEL UI + BACKEND FIX)

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileDown, ArrowLeft, AlertTriangle, CheckCircle, Info } from "lucide-react";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";

const Report = () => {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const storedItems = JSON.parse(localStorage.getItem("checkerItems") || "[]");

        if (!storedItems || storedItems.length < 2) return;

        const res = await fetch("http://localhost:5000/api/interactions/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: storedItems,
            user: {
              age: 25,
              conditions: [],
            },
          }),
        });

        const data = await res.json();

        let totalScore = 0;

        const findings = data.interactions.map((i: any) => {
          const score = i.personalizedScore || i.baseScore || 0;
          totalScore += score;

          return {
            severity:
              score >= 9 ? "High" :
              score >= 5 ? "Medium" : "Low",

            pair: `${i.itemA} + ${i.itemB}`,
            score,
            baseScore: i.baseScore,
            personalizedScore: i.personalizedScore,
            detail: i.mechanism || i.effects?.join(", "),
            aiExplanation: i.aiExplanation || [],
          };
        });

        totalScore = Math.min(totalScore * 5, 100); // normalize

        const recommendations = data.interactions.map((i: any) => i.recommendation);

        setReport({
          items: storedItems,
          riskScore: totalScore,
          findings,
          recommendations,
        });

      } catch (err) {
        console.error("Error loading report:", err);
      }
    };

    fetchReport();
  }, []);

  const generateSummary = () => {
    if (!report) return "";

    if (report.riskScore >= 70)
      return "⚠️ High risk interactions detected. Immediate medical consultation is strongly advised.";
    if (report.riskScore >= 40)
      return "⚠️ Moderate risk detected. Monitor closely and avoid unsafe combinations.";
    if (report.riskScore > 0)
      return "ℹ️ Minor interactions detected. Generally safe with precautions.";
    return "✅ No significant interactions detected.";
  };

  const downloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.text("MediSafe AI Report", 10, y);

    y += 10;
    doc.setFontSize(12);
    doc.text(generateSummary(), 10, y);

    y += 10;
    doc.text(`Risk Score: ${report.riskScore}/100`, 10, y);

    y += 10;
    report.findings.forEach((f: any) => {
      doc.text(`${f.severity} - ${f.pair}`, 10, y);
      y += 6;
      doc.text(doc.splitTextToSize(f.detail, 180), 10, y);
      y += 10;
    });

    doc.save("medisafe-report.pdf");
  };

  if (!report) return null;

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <Link to="/checker" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Checker
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">

          <h1 className="font-heading text-3xl font-bold text-foreground">
            🧠 Detailed Risk Report
          </h1>

          {/* AI Summary */}
          <div className="mt-4 rounded-xl border bg-muted p-4 text-sm">
            {generateSummary()}
          </div>

          {/* Risk Score + Progress */}
          <div className="mt-8 rounded-xl border bg-card p-6 shadow-sm text-center">
            <p className="text-sm text-muted-foreground">Overall Risk Score</p>
            <p className="text-5xl font-extrabold mt-2">{report.riskScore}</p>

            <div className="mt-4 h-3 w-full bg-muted rounded">
              <div
                className={`h-3 rounded ${
                  report.riskScore >= 70
                    ? "bg-red-500"
                    : report.riskScore >= 40
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${report.riskScore}%` }}
              />
            </div>
          </div>

          {/* Findings */}
          <h2 className="mt-10 text-xl font-semibold">Interaction Analysis</h2>

          <div className="mt-4 space-y-5">
            {report.findings.map((f: any) => {
              const Icon =
                f.severity === "High"
                  ? AlertTriangle
                  : f.severity === "Medium"
                  ? Info
                  : CheckCircle;

              return (
                <div key={f.pair} className="rounded-xl border p-5">

                  <div className="flex items-center gap-2 font-semibold">
                    <Icon className="h-5 w-5" />
                    {f.severity} — {f.pair}
                    <span className="ml-auto text-xs px-2 py-1 bg-muted rounded">
                      Score: {f.score}
                    </span>
                  </div>

                  <p className="mt-2 text-sm">{f.detail}</p>

                  {/* 🔥 FULL AI EXPLANATION */}
                  <ul className="mt-3 text-sm space-y-1">
                    {f.aiExplanation.map((point: string, i: number) => (
                      <li key={i}>• {point}</li>
                    ))}
                  </ul>

                  {/* 🧠 Risk Breakdown */}
                  <div className="mt-3 text-xs text-muted-foreground">
                    Base: {f.baseScore} + Personalization → {f.personalizedScore}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          <h2 className="mt-10 text-xl font-semibold">Recommendations</h2>
          <ul className="mt-4 space-y-2">
            {report.recommendations.map((rec: string, i: number) => (
              <li key={i} className="text-sm">• {rec}</li>
            ))}
          </ul>

          {/* Actions */}
          <div className="mt-10 flex gap-3">
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg"
            >
              <FileDown className="h-4 w-4" /> Download PDF
            </button>

            <Link to="/checker" className="border px-6 py-2.5 rounded-lg">
              Back
            </Link>
          </div>

        </motion.div>
      </div>
    </Layout>
  );
};

export default Report;