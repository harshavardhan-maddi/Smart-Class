"use client";

import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  Award, 
  Download,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";

const punctualityData = [
  { name: "Mon", present: 95, late: 5 },
  { name: "Tue", present: 88, late: 12 },
  { name: "Wed", present: 92, late: 8 },
  { name: "Thu", present: 85, late: 15 },
  { name: "Fri", present: 98, late: 2 },
  { name: "Sat", present: 70, late: 30 },
];

const activityData = [
  { time: "9:00", active: 24 },
  { time: "10:00", active: 28 },
  { time: "11:00", active: 32 },
  { time: "12:00", active: 30 },
  { time: "1:00", active: 15 },
  { time: "2:00", active: 26 },
  { time: "3:00", active: 34 },
  { time: "4:00", active: 22 },
];

const departmentData = [
  { name: "CSE", value: 400 },
  { name: "ECE", value: 300 },
  { name: "MECH", value: 200 },
  { name: "CIVIL", value: 150 },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("Weekly");

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Insights</h1>
          <p className="text-white/40 mt-1">Comprehensive data on faculty performance and classroom activity</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {["Daily", "Weekly", "Monthly"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === range ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card flex items-center gap-6">
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center text-success">
            <Award size={32} />
          </div>
          <div>
            <p className="text-white/40 text-sm font-medium">Avg. Punctuality</p>
            <h4 className="text-3xl font-bold text-white">92.4%</h4>
            <p className="text-success text-xs mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp size={12} /> +2.1% from last week
            </p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-white/40 text-sm font-medium">Avg. Entry Time</p>
            <h4 className="text-3xl font-bold text-white">09:04 AM</h4>
            <p className="text-white/20 text-xs mt-1">Within 5 min grace period</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-6">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <Users size={32} />
          </div>
          <div>
            <p className="text-white/40 text-sm font-medium">Active Faculty</p>
            <h4 className="text-3xl font-bold text-white">128</h4>
            <p className="text-white/20 text-xs mt-1">Across 32 departments</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Punctuality Bar Chart */}
        <div className="glass-card !p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Calendar className="text-primary" size={20} />
              Weekly Punctuality
            </h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                <span className="text-white/40">Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-danger rounded-full"></div>
                <span className="text-white/40">Late</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={punctualityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="late" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Area Chart */}
        <div className="glass-card !p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="text-accent" size={20} />
              Classroom Activity Peak
            </h3>
            <Filter size={18} className="text-white/20 cursor-pointer" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorActive)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart & Latest Activity */}
        <div className="glass-card !p-8">
          <h3 className="text-xl font-bold text-white mb-8">Dept. Punctuality</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {departmentData.map((dept, i) => (
              <div key={dept.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                <span className="text-white/40 text-sm">{dept.name}</span>
                <span className="text-white font-bold ml-auto">{dept.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card !p-8">
          <h3 className="text-xl font-bold text-white mb-8">System Audit Trail</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#3b82f6]"></div>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    <span className="text-primary">Admin</span> created new CR account for <span className="text-white font-bold">CSE-B</span>
                  </p>
                  <p className="text-white/20 text-xs mt-1">2 hours ago • Session ID: 9482-AD</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 border border-white/5 rounded-xl text-white/30 text-sm font-bold hover:bg-white/5 hover:text-white transition-all">
            View Full Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
