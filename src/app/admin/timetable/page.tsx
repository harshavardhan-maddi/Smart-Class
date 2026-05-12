"use client";

import React, { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Save, 
  Trash2, 
  BookOpen, 
  User as UserIcon,
  Plus,
  School,
  Clock,
  History,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function MasterScheduler() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = () => {
      const clsData = storage.get("classrooms") || [];
      setClassrooms(clsData);
    };
    fetchData();
    return storage.onUpdate(fetchData);
  }, []);

  useEffect(() => {
    if (selectedClassroom && selectedDay) {
      const allSchedules = storage.get("master_schedules") || {};
      const key = `${selectedClassroom}_${selectedDay}`;
      setSchedule(allSchedules[key] || []);
    }
  }, [selectedClassroom, selectedDay]);

  const handleAddRow = () => {
    setSchedule([...schedule, {
      id: `p_${Date.now()}`,
      name: `P${schedule.length + 1}`,
      startTime: "09:00",
      endTime: "10:00",
      subject: "",
      facultyName: ""
    }]);
  };

  const handleUpdateRow = (id: string, field: string, value: string) => {
    setSchedule(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleRemoveRow = (id: string) => {
    setSchedule(schedule.filter(row => row.id !== id));
  };

  const handleSave = () => {
    if (!selectedClassroom || !selectedDay) return;
    
    const allSchedules = storage.get("master_schedules") || {};
    const key = `${selectedClassroom}_${selectedDay}`;
    
    // Sort by start time before saving
    const sortedSchedule = [...schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    allSchedules[key] = sortedSchedule;
    storage.set("master_schedules", allSchedules);
    alert(`Schedule for ${selectedDay} synchronized successfully!`);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            Master<span className="text-primary">Scheduler</span>
          </h1>
          <p className="text-white/30 font-bold">Unified control for classroom timings and faculty assignments.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleAddRow} className="btn-secondary-premium !px-6">
            <Plus size={20} />
            <span>Add Period</span>
          </button>
          <button onClick={handleSave} className="btn-primary-premium !px-10">
            <Save size={20} />
            <span>Sync All</span>
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card-premium !p-6 flex items-center gap-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <School size={24} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-2">Select Unit</label>
            <select 
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="premium-input w-full appearance-none !py-3"
            >
              <option value="" className="bg-slate-900">Choose Classroom...</option>
              {classrooms.map(cls => (
                <option key={cls.id} value={cls.id} className="bg-slate-900">{cls.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="glass-card-premium !p-6 flex items-center gap-6">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            <CalendarDays size={24} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-2">Select Day</label>
            <select 
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="premium-input w-full appearance-none !py-3"
            >
              {DAYS.map(day => (
                <option key={day} value={day} className="bg-slate-900">{day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Unified Schedule Table */}
      <AnimatePresence mode="wait">
        {!selectedClassroom ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card-premium py-32 text-center"
          >
            <Clock className="w-20 h-20 text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white/20 uppercase tracking-[0.3em]">Initialize unit schedule</h3>
          </motion.div>
        ) : (
          <motion.div 
            key={`${selectedClassroom}_${selectedDay}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {schedule.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                <p className="text-white/20 font-bold">No periods defined for this day. Click "Add Period" to start.</p>
              </div>
            )}
            
            <div className="space-y-4">
              {schedule.map((row) => (
                <div key={row.id} className="glass-card-premium !p-6 flex flex-col xl:flex-row gap-6 items-center hover:bg-white/[0.04] transition-all group">
                  
                  {/* Period Name & Time */}
                  <div className="w-full xl:w-72 flex gap-4">
                    <div className="flex-1">
                      <input 
                        type="text" value={row.name}
                        onChange={(e) => handleUpdateRow(row.id, "name", e.target.value)}
                        className="premium-input w-full !py-3 text-center font-black"
                        placeholder="P1"
                      />
                    </div>
                    <div className="flex-[2] flex items-center gap-2">
                      <input 
                        type="time" value={row.startTime}
                        onChange={(e) => handleUpdateRow(row.id, "startTime", e.target.value)}
                        className="premium-input w-full !px-3 !py-3 text-xs"
                      />
                      <span className="text-white/20">-</span>
                      <input 
                        type="time" value={row.endTime}
                        onChange={(e) => handleUpdateRow(row.id, "endTime", e.target.value)}
                        className="premium-input w-full !px-3 !py-3 text-xs"
                      />
                    </div>
                  </div>

                  {/* Subject & Faculty */}
                  <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group/input">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary transition-colors" size={18} />
                      <input 
                        type="text" placeholder="Subject" value={row.subject}
                        onChange={(e) => handleUpdateRow(row.id, "subject", e.target.value)}
                        className="premium-input w-full pl-12 !py-3"
                      />
                    </div>
                    <div className="relative group/input">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-accent transition-colors" size={18} />
                      <input 
                        type="text" placeholder="Faculty" value={row.facultyName}
                        onChange={(e) => handleUpdateRow(row.id, "facultyName", e.target.value)}
                        className="premium-input w-full pl-12 !py-3"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <button 
                    onClick={() => handleRemoveRow(row.id)}
                    className="p-3 text-white/10 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
