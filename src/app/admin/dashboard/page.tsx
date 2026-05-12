"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { usePeriodEngine } from "@/hooks/usePeriodEngine";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowUpRight,
  School,
  Monitor,
  Calendar,
  Zap,
  Hash
} from "lucide-react";

export default function AdminDashboard() {
  const { currentDay, currentTime } = usePeriodEngine();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [liveStatuses, setLiveStatuses] = useState<Record<string, any>>({});
  const [stats, setStats] = useState({ total: 0, present: 0, missing: 0 });
  const [notification, setNotification] = useState<{msg: string, type: string} | null>(null);
  const prevStatusesRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: clsData } = await supabase.from("classrooms").select("*");
      const { data: allSchedules } = await supabase.from("master_schedules").select("*").eq("day", currentDay);
      const todayStr = new Date().toISOString().split("T")[0];
      const { data: allStatuses } = await supabase.from("live_status").select("*").eq("date", todayStr);
      
      const nowTotal = currentTime.getHours() * 60 + currentTime.getMinutes();
      const statuses: Record<string, any> = {};
      let presentCount = 0;

      clsData?.forEach((cls: any) => {
        const schedule = allSchedules?.find(s => s.classroom_id === cls.id)?.periods || [];
        const active = schedule.find((p: any) => {
          const [sH, sM] = p.startTime.split(":").map(Number);
          const [eH, eM] = p.endTime.split(":").map(Number);
          return nowTotal >= (sH * 60 + sM) && nowTotal < (eH * 60 + eM);
        });

        if (active) {
          const s = allStatuses?.find(st => st.classroom_id === cls.id && st.period_id === active.id) || { status: "pending" };
          statuses[cls.id] = { ...s, periodName: active.name, facultyName: active.facultyName };
          if (s.status === "entered") presentCount++;
        }
      });

      // Notification logic
      Object.keys(statuses).forEach(cid => {
        const newS = statuses[cid];
        const oldS = prevStatusesRef.current[cid];
        if (newS.status === "entered" && (!oldS || oldS.status !== "entered")) {
          const clsName = clsData?.find(c => c.id === cid)?.name || "Classroom";
          setNotification({ msg: `${newS.faculty_name} entered ${clsName}`, type: "success" });
          setTimeout(() => setNotification(null), 5000);
        }
      });

      prevStatusesRef.current = statuses;
      setLiveStatuses(statuses);
      setClassrooms(clsData || []);
      setStats({ total: clsData?.length || 0, present: presentCount, missing: Math.max(0, (clsData?.length || 0) - presentCount) });
    };

    fetchData();

    const statusChannel = supabase.channel("live_admin").on("postgres_changes", { event: "*", schema: "public", table: "live_status" }, fetchData).subscribe();
    return () => { statusChannel.unsubscribe(); };
  }, [currentDay, currentTime]);

  return (
    <div className="space-y-12 pb-20 relative">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 right-10 z-[100] glass-card-premium !p-5 flex items-center gap-4 border-success/30 bg-success/5 shadow-2xl"
          >
            <div className="w-10 h-10 bg-success rounded-xl flex items-center justify-center text-white"><Zap size={20} /></div>
            <div>
              <p className="text-[10px] font-black text-success uppercase tracking-widest">Entry Notification</p>
              <p className="text-white font-bold tracking-tight">{notification.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.4em] mb-4">
            <Monitor size={16} /> SUPABASE COMMAND CENTER
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-4">Live<span className="text-primary">Monitor</span></h1>
          <p className="text-white/30 font-bold text-lg max-w-2xl">Global real-time tracking via Supabase Infrastructure.</p>
        </motion.div>
        <div className="flex gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-[2.5rem]">
           <HeaderInfo icon={Calendar} label="Day" value={currentDay} />
           <HeaderInfo icon={Clock} label="Time" value={currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCardPremium label="Managed Units" value={stats.total} icon={School} color="from-blue-500 to-cyan-500" desc="Cloud Database" />
        <StatCardPremium label="Realtime Sync" value="ACTIVE" icon={Zap} color="from-purple-500 to-pink-500" desc="Supabase Publication" />
        <StatCardPremium label="Faculty Presence" value={stats.present} icon={CheckCircle2} color="from-emerald-500 to-teal-500" desc="Live Status" />
        <StatCardPremium label="Absence Alert" value={stats.missing} icon={AlertCircle} color="from-rose-500 to-orange-500" desc="Immediate Attention" isWarning={stats.missing > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {classrooms.map((cls, idx) => {
          const status = liveStatuses[cls.id];
          const isEntered = status?.status === "entered";
          const isActivePeriod = !!status?.periodName;

          return (
            <motion.div
              key={cls.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className={`glass-card-premium relative group border-t-8 ${!isActivePeriod ? "border-t-white/10" : isEntered ? "border-t-success/40" : "border-t-danger/40"}`}
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter">{cls.name}</h3>
                  <p className="text-white/20 font-bold text-xs flex items-center gap-2"><Hash size={12} /> ROOM {cls.room_number}</p>
                </div>
                <div className={`status-badge ${!isActivePeriod ? "bg-white/5 text-white/20" : isEntered ? "bg-success/5 text-success" : "bg-danger/5 text-danger animate-pulse"}`}>
                  <div className={`w-2 h-2 rounded-full ${!isActivePeriod ? "bg-white/20" : isEntered ? "bg-success shadow-[0_0_8px_#10b981]" : "bg-danger shadow-[0_0_8px_#ef4444]"}`} />
                  {!isActivePeriod ? "Idle" : isEntered ? "Active" : "Alert"}
                </div>
              </div>
              <div className="space-y-6 mb-10 text-white/40 text-sm font-bold">
                <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl"><Users size={18} /> {status?.facultyName || "---"}</div>
                <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl"><Clock size={18} /> {status?.periodName || "OFF-SCHEDULE"}</div>
              </div>
              <div className="pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">
                <Activity size={14} className="inline mr-2" />
                {isEntered ? `LOGGED AT ${new Date(status.timestamp!).toLocaleTimeString()}` : "TRACKING CLOUD STATUS"}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function HeaderInfo({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 px-4">
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40"><Icon size={20} /></div>
      <div>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{label}</p>
        <p className="text-white font-bold text-sm">{value}</p>
      </div>
    </div>
  );
}

function StatCardPremium({ label, value, icon: Icon, color, desc, isWarning }: any) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="glass-card-premium relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{label}</p>
          <h4 className="text-5xl font-black text-white tracking-tighter">{value}</h4>
          <p className={`text-[10px] font-bold mt-2 tracking-widest uppercase ${isWarning ? "text-danger" : "text-white/20"}`}>{desc}</p>
        </div>
        <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl`}>
          <Icon size={28} />
        </div>
      </div>
    </motion.div>
  );
}
