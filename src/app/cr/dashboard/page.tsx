"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePeriodEngine } from "@/hooks/usePeriodEngine";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, 
  Clock, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Shield
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CRDashboard() {
  const { profile, loading: authLoading, logout } = useAuth();
  const { activePeriod, currentDay, currentTime } = usePeriodEngine(profile?.assigned_classroom_id);
  const [classroom, setClassroom] = useState<any>(null);
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!profile?.assigned_classroom_id) return;
    
    const updateData = async () => {
      // Fetch Classroom Details
      const { data: cls } = await supabase.from("classrooms").select("*").eq("id", profile.assigned_classroom_id).single();
      setClassroom(cls);

      if (activePeriod) {
        const todayStr = new Date().toISOString().split("T")[0];
        const statusId = `${profile.assigned_classroom_id}_${activePeriod.id}_${todayStr}`;
        const { data: status } = await supabase.from("live_status").select("*").eq("id", statusId).single();
        setLiveStatus(status || { status: "pending" });
      } else {
        setLiveStatus(null);
      }
    };

    updateData();

    const channel = supabase.channel(`cr_live_${profile.assigned_classroom_id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "live_status", filter: `classroom_id=eq.${profile.assigned_classroom_id}` }, updateData)
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [profile, activePeriod]);

  const handleMarkPresent = async () => {
    if (!profile?.assigned_classroom_id || !activePeriod) return;
    setActionLoading(true);
    
    const todayStr = new Date().toISOString().split("T")[0];
    const statusId = `${profile.assigned_classroom_id}_${activePeriod.id}_${todayStr}`;

    const newStatus = {
      id: statusId,
      classroom_id: profile.assigned_classroom_id,
      period_id: activePeriod.id,
      date: todayStr,
      status: "entered",
      faculty_name: activePeriod.facultyName,
      subject: activePeriod.subject,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase.from("live_status").upsert(newStatus);
    
    if (!error) {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex flex-col p-6 md:p-12 max-w-4xl mx-auto w-full relative">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full -z-10" />
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-[1.5rem] flex items-center justify-center shadow-2xl">
            <Shield className="text-primary w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">{classroom?.name || "Initializing..."}</h2>
            <div className="flex items-center gap-2 mt-1 text-white/30 text-xs font-bold uppercase tracking-widest">
              <Hash size={12} /> ROOM {classroom?.room_number || "---"}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-14 h-14 bg-white/[0.03] hover:bg-danger/10 hover:text-danger border border-white/5 rounded-xl flex items-center justify-center transition-all duration-500">
          <LogOut size={22} />
        </button>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!activePeriod ? (
            <motion.div key="no-period" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card-premium w-full text-center py-20">
              <Clock className="w-16 h-16 text-white/5 mx-auto mb-8" />
              <h3 className="text-3xl font-black text-white mb-3">Idle State</h3>
              <p className="text-white/30 font-medium tracking-wide">Awaiting next cloud-synced session.</p>
            </motion.div>
          ) : (
            <motion.div key="active-period" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-8">
              <div className="glass-card-premium !p-10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 block">Supabase Live Link</span>
                    <h3 className="text-5xl font-black text-white tracking-tighter">{activePeriod.subject || "No Subject"}</h3>
                    <p className="text-white/40 font-bold text-lg mt-1">{activePeriod.name} Session</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 px-6 py-3 rounded-2xl text-white font-black text-lg">
                    {activePeriod.startTime} - {activePeriod.endTime}
                  </div>
                </div>

                <div className="flex items-center gap-6 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 mb-12">
                  <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center shadow-lg"><UserIcon className="text-accent w-8 h-8" /></div>
                  <div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Assigned Faculty</p>
                    <p className="text-white font-black text-2xl tracking-tight">{activePeriod.facultyName || "No Faculty"}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {liveStatus?.status === "entered" ? (
                    <div className="w-full p-12 rounded-[2.5rem] bg-success/5 border border-success/20 flex flex-col items-center gap-6">
                      <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center"><CheckCircle2 className="text-white w-12 h-12" /></div>
                      <div className="text-center italic">
                        <p className="text-success font-black text-3xl uppercase tracking-tighter">Entry Confirmed</p>
                        <p className="text-success/40 font-bold text-sm mt-2 tracking-widest">CLOUD SYNCED AT {new Date(liveStatus.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleMarkPresent} disabled={actionLoading}
                      className="w-full p-12 rounded-[2.5rem] bg-danger/5 border border-danger/20 flex flex-col items-center gap-6 group/btn transition-all duration-500"
                    >
                      <div className="w-24 h-24 bg-danger rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                        {actionLoading ? <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <AlertCircle className="text-white w-12 h-12 animate-pulse" />}
                      </div>
                      <div className="text-center">
                        <p className="text-danger font-black text-3xl uppercase tracking-tighter italic">Confirm Entry</p>
                        <p className="text-danger/40 font-bold text-sm mt-2 tracking-widest animate-pulse">PENDING CLOUD UPLOAD</p>
                      </div>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
