import { motion } from "framer-motion";
import { Gauge, Activity, AlertTriangle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Layout from "@/components/Layout";

const summaryCards = [
  { icon: Gauge, label: "Risk Score", value: "42 / 100", accent: "text-primary bg-primary/10" },
  { icon: Activity, label: "Total Checks", value: "28", accent: "text-accent bg-accent/10" },
  { icon: AlertTriangle, label: "High Risk Alerts", value: "3", accent: "text-severity-high bg-severity-high/10" },
];

const pieData = [
  { name: "Low", value: 15, color: "hsl(150,50%,45%)" },
  { name: "Medium", value: 10, color: "hsl(40,85%,55%)" },
  { name: "High", value: 3, color: "hsl(0,72%,55%)" },
];

const lineData = [
  { date: "Jan", checks: 2 }, { date: "Feb", checks: 5 }, { date: "Mar", checks: 3 },
  { date: "Apr", checks: 7 }, { date: "May", checks: 4 }, { date: "Jun", checks: 7 },
];

const recentActivity = [
  { id: 1, items: "Warfarin + Aspirin", severity: "High", date: "2 hours ago" },
  { id: 2, items: "Lisinopril + Potassium", severity: "Medium", date: "1 day ago" },
  { id: 3, items: "Metformin + B12", severity: "Low", date: "3 days ago" },
];

const Dashboard = () => (
  <Layout>
    <div className="container py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Your health interaction insights at a glance.</p>

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {summaryCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className={`inline-flex rounded-lg p-2.5 ${c.accent}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-card-foreground">{c.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold text-card-foreground">Risk Distribution</h3>
          <div className="mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4}>
                  {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold text-card-foreground">Checks Over Time</h3>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,20%,90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="checks" stroke="hsl(205,78%,48%)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-10 rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-card-foreground">Recent Activity</h3>
        <div className="mt-4 space-y-3">
          {recentActivity.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-card-foreground">{a.items}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  a.severity === "High" ? "bg-severity-high/10 text-severity-high" :
                  a.severity === "Medium" ? "bg-severity-medium/10 text-severity-medium" :
                  "bg-severity-low/10 text-severity-low"
                }`}>{a.severity}</span>
                <span className="text-xs text-muted-foreground">{a.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Layout>
);

export default Dashboard;
