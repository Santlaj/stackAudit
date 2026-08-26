"use client";

import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Github, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSocialLogin = async (provider: "github" | "google") => {
    setError(null);
    if (provider === "github") setLoadingGithub(true);

    try {
      const { data, error: authError } = await signIn.social({
        provider,
        callbackURL: `${window.location.origin}/`,
      });
      if (authError) throw new Error(authError.message || "Failed to sign in");
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}.`);
      if (provider === "github") setLoadingGithub(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    setError(null);
    setLoadingEmail(true);

    try {
      const { data, error: authError } = await signIn.email({
        email,
        password,
        callbackURL: `${window.location.origin}/`,
      });
      
      if (authError) {
        throw new Error(authError.message || "Invalid credentials.");
      }
      
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
      setLoadingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">Enter your email and password to access your account</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-sm p-3 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground tracking-tight">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={loadingEmail}
            className="w-full bg-background border border-border/60 rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all disabled:opacity-50"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground tracking-tight">
              Password
            </label>
            <a href="#" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loadingEmail}
              className="w-full bg-background border border-border/60 rounded-md pl-3 pr-10 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all disabled:opacity-50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loadingEmail || loadingGithub}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 font-medium px-4 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loadingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-border/40"></div>
        <span className="shrink-0 px-3 text-xs text-muted-foreground bg-card">Or continue with</span>
        <div className="flex-grow border-t border-border/40"></div>
      </div>

      <button
        type="button"
        onClick={() => handleSocialLogin("github")}
        disabled={loadingGithub || loadingEmail}
        className="w-full flex items-center justify-center gap-3 bg-transparent border border-border/60 text-foreground hover:bg-muted/30 font-medium px-4 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
        GitHub
      </button>

      <p className="text-[12px] text-center text-muted-foreground px-4 mt-6 leading-relaxed">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline hover:text-foreground transition-colors">Terms of Service</a>
      </p>

      <div className="text-center text-[13px] text-muted-foreground pt-2">
        Don't have an account? <a href="/signup" className="text-foreground font-medium hover:underline">Sign up</a>
      </div>
    </div>
  );
}
