import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Shield, Brain, Gauge, Clock } from "lucide-react";
import Layout from "@/components/Layout";

const features = [
  { icon: Shield, title: "Drug Interaction Detection", desc: "Instantly detect harmful interactions between medications, supplements, and foods." },
  { icon: Brain, title: "AI Explanation", desc: "Get plain-language explanations powered by medical AI so you understand the risks." },
  { icon: Gauge, title: "Personalized Risk Score", desc: "Receive a risk score tailored to your health profile, age, and conditions." },
  { icon: Clock, title: "Smart Dose Timing", desc: "Optimal scheduling suggestions to minimize conflicts and maximize efficacy." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => (
  <Layout>
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary py-20 md:py-32">
      <div className="container text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl font-heading text-4xl font-extrabold leading-tight text-foreground md:text-5xl lg:text-6xl"
        >
          Check Your Medicines{" "}
          <span className="text-primary">Before They Harm You</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
        >
          MediSafe AI detects dangerous drug interactions in seconds — keeping you and your loved ones safe.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto mt-10 flex max-w-lg items-center gap-2 rounded-xl border justify-center bg-card p-2 text-justify shadow-lg"
        >
          <Link
            to="/checker"
            className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Checking
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20">
      <div className="container">
        <h2 className="text-center font-heading text-3xl font-bold text-foreground">
          Why Choose <span className="text-primary">MediSafe AI</span>?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          Powered by AI and trusted medical databases to protect your health.
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Index;
