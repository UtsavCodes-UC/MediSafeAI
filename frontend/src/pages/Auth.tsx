import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ Auto redirect if already logged in (important for Google)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const personalDetails = localStorage.getItem("personalDetails");

        if (personalDetails) {
          navigate("/dashboard");
        } else {
          navigate("/personal-details");
        }
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Logged in successfully!");

        const personalDetails = localStorage.getItem("personalDetails");

        if (personalDetails) {
          navigate("/dashboard");
        } else {
          navigate("/personal-details");
        }
      }
    } else {
      // SIGN UP
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Check your email.");
      }
    }
  };

  // ✅ GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:8080/auth",
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <Layout>
      {" "}
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg"
        >
          {" "}
          <div className="mb-6 text-center">
            {" "}
            <ShieldCheck className="mx-auto h-10 w-10 text-primary" />{" "}
            <h1 className="mt-3 font-heading text-2xl font-bold text-card-foreground">
              {isLogin ? "Sign In" : "Create Account"}{" "}
            </h1>{" "}
            <p className="mt-1 text-sm text-muted-foreground">
              {isLogin
                ? "Sign in to access your dashboard"
                : "Start checking drug interactions today"}{" "}
            </p>{" "}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">or</span>
            </div>
          </div>
          {/* ✅ GOOGLE BUTTON CONNECTED */}
          <button
            onClick={handleGoogleLogin}
            className="w-full rounded-lg border py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Continue with Google
          </button>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary hover:underline"
            >
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};
export default Auth;
