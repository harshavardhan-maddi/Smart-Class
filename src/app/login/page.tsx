"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { storage } from "@/lib/storage";
import { motion } from "framer-motion";
import { LogIn, Shield, Lock, Mail, ChevronRight, Globe } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(email, password);

      if (success) {
        // Fetch fresh profile to redirect correctly
        const savedUser = storage.get("current_user");
        if (savedUser.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/cr/dashboard");
        }
      } else {
        setError("Invalid demo credentials. Use admin@college.com");
      }
    } catch (err: any) {
      setError("Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="glass-card-premium border-white/20 bg-white/[0.02]">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-primary via-primary to-accent rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-primary/40 relative group"
            >
              <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Shield className="text-white w-10 h-10 relative z-10" />
            </motion.div>
            
            <h1 className="text-4xl font-black text-white tracking-tight mb-2 text-center">
              Smart<span className="text-primary">Monitor</span>
            </h1>
            <p className="text-white/40 font-medium tracking-wide text-sm flex items-center gap-2">
              <Globe size={14} className="animate-spin-slow" /> ENTERPRISE ACCESS PORTAL
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] ml-1">
                Operator Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="admin@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="premium-input w-full pl-14"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] ml-1">
                Security Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="premium-input w-full pl-14"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold text-center tracking-wide"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-premium w-full mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Initialize Session</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            <span>v4.0.2 Stable</span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-success rounded-full" />
              All Systems Operational
            </span>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center gap-8 text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">
          <span className="hover:text-white/30 transition-colors cursor-pointer">Security Protocol</span>
          <span className="hover:text-white/30 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white/30 transition-colors cursor-pointer">Support</span>
        </div>
      </motion.div>
    </div>
  );
}
