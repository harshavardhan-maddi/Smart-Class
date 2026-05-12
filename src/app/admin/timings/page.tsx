"use client";

import React, { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Plus, 
  Trash2, 
  Timer, 
  CalendarClock,
  CheckCircle2,
  X,
  History
} from "lucide-react";

export default function PeriodTimings() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const fetchPeriods = () => {
      const data = storage.get("period_timings") || [];
      // Sort by start time
      const sorted = [...data].sort((a, b) => a.startTime.localeCompare(b.startTime));
      setPeriods(sorted);
    };
    fetchPeriods();
    return storage.onUpdate(fetchPeriods);
  }, []);

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const data = storage.get("period_timings") || [];
    const newPeriod = {
      id: `p_${Date.now()}`,
      ...formData
    };

    const updatedData = [...data, newPeriod];
    storage.set("period_timings", updatedData);
    
    setIsModalOpen(false);
    setFormData({ name: "", startTime: "", endTime: "" });
  };

  const handleDeletePeriod = (id: string) => {
    const data = storage.get("period_timings") || [];
    const updatedData = data.filter((p: any) => p.id !== id);
    storage.set("period_timings", updatedData);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            Period<span className="text-primary">Master</span>
          </h1>
          <p className="text-white/30 font-bold">Define global time slots for the entire campus schedule.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary-premium"
        >
          <Plus size={20} />
          <span>Define New Slot</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <AnimatePresence>
          {periods.map((period, idx) => (
            <motion.div
              key={period.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card-premium relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
              
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-primary transition-all duration-500">
                  <Timer size={24} />
                </div>
                <button 
                  onClick={() => handleDeletePeriod(period.id)}
                  className="p-2 text-white/10 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-1 mb-8">
                <h3 className="text-3xl font-black text-white tracking-tighter">{period.name}</h3>
                <p className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Institutional Slot</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="text-center flex-1 border-r border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase mb-1">Start</p>
                  <p className="text-white font-bold">{period.startTime}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] font-black text-white/20 uppercase mb-1">End</p>
                  <p className="text-white font-bold">{period.endTime}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg glass-card-premium relative z-10"
            >
              <h2 className="text-3xl font-black text-white tracking-tighter mb-8">Define Slot</h2>
              <form onSubmit={handleCreatePeriod} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Slot Name (e.g. P1)</label>
                  <input 
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="premium-input w-full" placeholder="Period 1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Start Time</label>
                    <input 
                      type="time" required value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="premium-input w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">End Time</label>
                    <input 
                      type="time" required value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="premium-input w-full"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary-premium w-full mt-4 py-5">
                  <CheckCircle2 size={22} />
                  <span>Register Time Slot</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
