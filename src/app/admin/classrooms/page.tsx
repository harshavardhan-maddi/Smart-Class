"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePeriodEngine } from "@/hooks/usePeriodEngine";
import { motion, AnimatePresence } from "framer-motion";
import { 
  School, 
  Plus, 
  Trash2, 
  Building2, 
  Search,
  CheckCircle2,
  X,
  MapPin,
  CalendarDays,
  Clock,
  BookOpen,
  User as UserIcon,
  AlertCircle
} from "lucide-react";

export default function ClassroomHub() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentDay, currentTime } = usePeriodEngine();

  const [currentDaySchedule, setCurrentDaySchedule] = useState<any[]>([]);
  const [liveStatuses, setLiveStatuses] = useState<Record<string, any>>({});
  const [classroomForm, setClassroomForm] = useState({ name: "", roomNumber: "", department: "", semester: "" });

  // 1. Fetch Classrooms & Listen for Realtime Updates
  useEffect(() => {
    const fetchClassrooms = async () => {
      const { data } = await supabase.from("classrooms").select("*").order("created_at", { ascending: true });
      setClassrooms(data || []);
    };

    fetchClassrooms();

    const channel = supabase
      .channel("classrooms_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "classrooms" }, fetchClassrooms)
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, []);

  // 2. Fetch Schedule & Live Status for Selected Classroom
  useEffect(() => {
    if (!selectedClassroom) return;

    const fetchScheduleAndStatus = async () => {
      // Fetch Schedule
      const { data: scheduleData } = await supabase
        .from("master_schedules")
        .select("periods")
        .eq("classroom_id", selectedClassroom.id)
        .eq("day", currentDay)
        .single();
      
      const periods = scheduleData?.periods || [];
      setCurrentDaySchedule(periods);

      // Fetch Live Statuses
      const todayStr = new Date().toISOString().split("T")[0];
      const { data: statusData } = await supabase
        .from("live_status")
        .select("*")
        .eq("classroom_id", selectedClassroom.id)
        .eq("date", todayStr);
      
      const statuses: Record<string, any> = {};
      statusData?.forEach(s => { statuses[s.period_id] = s; });
      setLiveStatuses(statuses);
    };

    fetchScheduleAndStatus();

    const statusChannel = supabase
      .channel(`status_${selectedClassroom.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "live_status", filter: `classroom_id=eq.${selectedClassroom.id}` }, fetchScheduleAndStatus)
      .subscribe();

    const scheduleChannel = supabase
      .channel(`schedule_${selectedClassroom.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "master_schedules", filter: `classroom_id=eq.${selectedClassroom.id}` }, fetchScheduleAndStatus)
      .subscribe();

    return () => { 
      statusChannel.unsubscribe(); 
      scheduleChannel.unsubscribe();
    };
  }, [selectedClassroom, currentDay, currentTime]);

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("classrooms").insert([classroomForm]);
    setIsCreateModalOpen(false);
    setClassroomForm({ name: "", roomNumber: "", department: "", semester: "" });
  };

  const handleDeleteClassroom = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("classrooms").delete().eq("id", id);
    if (selectedClassroom?.id === id) setSelectedClassroom(null);
  };

  const handleUpdateSchedule = async (updatedPeriods: any[]) => {
    await supabase.from("master_schedules").upsert({
      classroom_id: selectedClassroom.id,
      day: currentDay,
      periods: updatedPeriods
    }, { onConflict: "classroom_id,day" });
  };

  const handleAddPeriod = () => {
    const newPeriod = {
      id: `p_${Date.now()}`,
      name: `P${currentDaySchedule.length + 1}`,
      startTime: "09:00",
      endTime: "10:00",
      subject: "",
      facultyName: ""
    };
    handleUpdateSchedule([...currentDaySchedule, newPeriod]);
  };

  const handleUpdatePeriod = (id: string, field: string, value: string) => {
    const updated = currentDaySchedule.map(p => p.id === id ? { ...p, [field]: value } : p);
    handleUpdateSchedule(updated);
  };

  const handleDeletePeriod = (id: string) => {
    const updated = currentDaySchedule.filter(p => p.id !== id);
    handleUpdateSchedule(updated);
  };

  const filteredClassrooms = classrooms.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.room_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col xl:flex-row gap-10 h-full">
      {/* Left Column: Classroom List */}
      <div className={`flex-1 space-y-10 ${selectedClassroom ? 'hidden xl:block max-w-md' : 'w-full'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Campus<span className="text-primary">Hub</span></h1>
            <p className="text-white/30 text-sm font-bold">Manage your unit infrastructure.</p>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
            <Plus size={24} />
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" placeholder="Search units..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input w-full pl-12 !py-3 text-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredClassrooms.map(cls => (
            <motion.div
              key={cls.id}
              onClick={() => setSelectedClassroom(cls)}
              className={`p-6 rounded-[1.5rem] cursor-pointer transition-all duration-300 border ${
                selectedClassroom?.id === cls.id 
                ? 'bg-primary/10 border-primary' 
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedClassroom?.id === cls.id ? 'bg-primary text-white' : 'bg-white/5 text-white/20'}`}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">{cls.name}</h3>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Room {cls.room_number} • {cls.semester}</p>
                  </div>
                </div>
                <button onClick={(e) => handleDeleteClassroom(cls.id, e)} className="p-2 text-white/5 hover:text-danger transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Column: Deep View Hub */}
      <div className={`flex-[2] ${!selectedClassroom ? 'hidden xl:flex items-center justify-center' : 'block'}`}>
        <AnimatePresence mode="wait">
          {!selectedClassroom ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-32 h-32 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                <School className="w-16 h-16 text-white/5" />
              </div>
              <h2 className="text-2xl font-black text-white/10 uppercase tracking-[0.4em]">Select a unit for live database view</h2>
            </motion.div>
          ) : (
            <motion.div 
              key={selectedClassroom.id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="glass-card-premium !p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />
                <div className="flex items-center gap-6">
                  <button onClick={() => setSelectedClassroom(null)} className="xl:hidden w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/40">
                    <X size={20} />
                  </button>
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/20">
                    <School className="text-white w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-5xl font-black text-white tracking-tighter">{selectedClassroom.name}</h2>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <MapPin size={12} /> {selectedClassroom.department} • Room {selectedClassroom.room_number}
                    </p>
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/10 px-6 py-3 rounded-2xl">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{currentDay}</p>
                  <p className="text-white font-black text-lg">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-black text-white flex items-center gap-3">Performance Matrix</h3>
                   <button onClick={handleAddPeriod} className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:text-white transition-colors">
                      <Plus size={16} /> Add Slot
                   </button>
                </div>

                {currentDaySchedule.length === 0 ? (
                  <div className="py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center">
                    <CalendarDays className="w-16 h-16 text-white/5 mx-auto mb-4" />
                    <p className="text-white/20 font-bold">No schedule defined in Supabase.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentDaySchedule.map((p) => {
                      const status = liveStatuses[p.id];
                      const isEntered = status?.status === "entered";
                      const nowTotal = currentTime.getHours() * 60 + currentTime.getMinutes();
                      const [sH, sM] = p.startTime.split(":").map(Number);
                      const startTotal = sH * 60 + sM;
                      const isActive = nowTotal >= startTotal;
                      const isLate = isActive && !isEntered && nowTotal > (startTotal + 5);

                      return (
                        <div key={p.id} className={`glass-card-premium !p-6 flex flex-col lg:flex-row gap-6 items-center border-l-8 transition-all ${
                          isActive ? (isEntered ? 'border-l-success' : isLate ? 'border-l-warning' : 'border-l-primary') : 'border-l-white/5'
                        }`}>
                          <div className="w-full lg:w-48">
                             <input type="text" value={p.name} onChange={(e) => handleUpdatePeriod(p.id, "name", e.target.value)} className="bg-transparent text-white font-black text-xl w-full" />
                             <div className="flex items-center gap-2 mt-1">
                                <input type="time" value={p.startTime} onChange={(e) => handleUpdatePeriod(p.id, "startTime", e.target.value)} className="bg-transparent text-white/30 text-[10px]" />
                                <span className="text-white/10">-</span>
                                <input type="time" value={p.endTime} onChange={(e) => handleUpdatePeriod(p.id, "endTime", e.target.value)} className="bg-transparent text-white/30 text-[10px]" />
                             </div>
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <input type="text" value={p.subject} placeholder="Subject" onChange={(e) => handleUpdatePeriod(p.id, "subject", e.target.value)} className="premium-input w-full !py-2.5 text-sm" />
                            <input type="text" value={p.facultyName} placeholder="Faculty" onChange={(e) => handleUpdatePeriod(p.id, "facultyName", e.target.value)} className="premium-input w-full !py-2.5 text-sm" />
                          </div>

                          <div className="flex items-center gap-6">
                            <div className={`px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${isEntered ? 'text-success border-success/20 bg-success/5' : isLate ? 'text-warning border-warning/20 bg-warning/5' : 'text-white/20 border-white/10 bg-white/5'}`}>
                               {isEntered ? 'Present' : isLate ? 'Late' : 'Missing'}
                            </div>
                            <button onClick={() => handleDeletePeriod(p.id)} className="p-2 text-white/5 hover:text-danger"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Classroom Creation Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-lg glass-card-premium relative z-10">
              <h2 className="text-3xl font-black text-white tracking-tighter mb-8">Supabase Unit Registration</h2>
              <form onSubmit={handleCreateClassroom} className="space-y-6">
                <input type="text" required value={classroomForm.name} onChange={(e) => setClassroomForm({...classroomForm, name: e.target.value})} className="premium-input w-full" placeholder="Name" />
                <div className="grid grid-cols-2 gap-6">
                  <input type="text" required value={classroomForm.roomNumber} onChange={(e) => setClassroomForm({...classroomForm, roomNumber: e.target.value})} className="premium-input w-full" placeholder="Room No" />
                  <input type="text" required value={classroomForm.semester} onChange={(e) => setClassroomForm({...classroomForm, semester: e.target.value})} className="premium-input w-full" placeholder="Sem" />
                </div>
                <input type="text" required value={classroomForm.department} onChange={(e) => setClassroomForm({...classroomForm, department: e.target.value})} className="premium-input w-full" placeholder="Dept" />
                <button type="submit" className="btn-primary-premium w-full py-5">Add to Supabase</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
