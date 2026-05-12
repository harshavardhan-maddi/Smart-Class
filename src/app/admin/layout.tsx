"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  School, 
  Users, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Shield,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Live Monitor", href: "/admin/dashboard" },
  { icon: School, label: "Campus Units", href: "/admin/classrooms" },
  { icon: Users, label: "CR Accounts", href: "/admin/users" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) return null;
  if (profile?.role !== "admin") return null;

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 300 : 100 }}
        className="bg-white/[0.02] border-r border-white/5 backdrop-blur-3xl z-50 flex flex-col transition-all duration-500 ease-in-out relative"
      >
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Shield className="text-white w-6 h-6" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="ml-4">
                <h1 className="font-black text-xl tracking-tighter text-white">Smart<span className="text-primary">Monitor</span></h1>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Enterprise OS</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 py-10 px-4 space-y-3 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? "sidebar-link-active" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                <item.icon size={22} className={isActive ? "text-primary" : ""} />
                {isSidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold tracking-tight text-sm">{item.label}</motion.span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-danger/60 hover:text-danger hover:bg-danger/10 transition-all duration-300 font-bold text-sm tracking-tight">
            <LogOut size={22} />
            {isSidebarOpen && <span>Terminate Session</span>}
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 border-b border-white/5 px-10 flex items-center justify-between backdrop-blur-xl z-40 bg-slate-950/20">
          <div className="flex items-center gap-8">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-12 h-12 flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl transition-all text-white/40 hover:text-white">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-white/40">
                <Zap size={14} className="text-warning" />
                <span className="text-[10px] font-black uppercase tracking-widest">Unit Architecture Active</span>
             </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-white tracking-tight">{profile?.name}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Authorized Admin</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-tr from-primary to-accent rounded-2xl flex items-center justify-center text-white font-black text-xl">
                {profile?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
          {children}
        </main>
      </div>
    </div>
  );
}
