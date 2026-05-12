"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  School,
  Search,
  CheckCircle2,
  X
} from "lucide-react";

export default function CRManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    assignedClassroomId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase.from("profiles").select("*").eq("role", "cr");
      const { data: clsData } = await supabase.from("classrooms").select("*");
      setUsers(profileData || []);
      setClassrooms(clsData || []);
    };
    fetchData();

    const channel = supabase.channel("profiles_changes").on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchData).subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClassroom = classrooms.find(c => c.id === formData.assignedClassroomId);

    // Note: Creating actual Auth users requires Supabase Admin API or signUp
    // For this implementation, we assume the user is created in Supabase Auth dashboard
    // and we are just linking the profile here.
    const { error } = await supabase.from("profiles").upsert({
      email: formData.email,
      name: formData.name,
      role: "cr",
      assigned_classroom_id: formData.assignedClassroomId,
      // We use email as a temporary ID if we don't have the UUID yet, 
      // but ideally we should use the UUID from Auth.
      // However, upserting by email is a common pattern for pre-provisioning.
    });

    if (!error) {
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", assignedClassroomId: "" });
    }
  };

  const handleDeleteUser = async (id: string) => {
    await supabase.from("profiles").delete().eq("id", id);
  };

  const filteredUsers = users.filter(u => 
    u.role === "cr" && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            CR<span className="text-primary">Accounts</span>
          </h1>
          <p className="text-white/30 font-bold">Manage and authorize Classroom Representatives.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary-premium"
        >
          <UserPlus size={20} />
          <span>Authorize New CR</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input w-full pl-14"
          />
        </div>
        <div className="glass-card-premium !p-5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                 <Users size={20} />
              </div>
              <p className="text-sm font-bold text-white/60">Total Active CRs</p>
           </div>
           <p className="text-3xl font-black text-white">{filteredUsers.length}</p>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredUsers.map((user) => {
            const classroomName = classrooms.find(c => c.id === user.assigned_classroom_id)?.name || "Not Assigned";
            return (
              <motion.div
                key={user.id || user.email}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card-premium group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-gradient-to-tr from-white/10 to-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-500">
                    <ShieldCheck size={28} />
                  </div>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-3 text-white/10 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="text-2xl font-black text-white tracking-tight">{user.name}</h3>
                  <p className="text-white/30 text-sm font-medium flex items-center gap-2">
                    <Mail size={14} /> {user.email}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center text-success">
                    <School size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Assigned Class</p>
                    <p className="text-white font-bold text-sm tracking-tight">{classroomName}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg glass-card-premium relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white tracking-tighter">CR Authorization</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="premium-input w-full"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="premium-input w-full"
                    placeholder="cr@college.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="premium-input w-full"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Assign Classroom</label>
                  <select 
                    required
                    value={formData.assignedClassroomId}
                    onChange={(e) => setFormData({...formData, assignedClassroomId: e.target.value})}
                    className="premium-input w-full appearance-none"
                  >
                    <option value="" disabled className="bg-slate-900">Select a classroom</option>
                    {classrooms.map(cls => (
                      <option key={cls.id} value={cls.id} className="bg-slate-900">{cls.name} (Room {cls.roomNumber})</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn-primary-premium w-full mt-4 py-5 text-lg">
                  <CheckCircle2 size={22} />
                  <span>Finalize Authorization</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
