"use client";

// Simple persistent storage engine that works across tabs
export const storage = {
  get: (key: string) => {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  
  set: (key: string, value: any) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for cross-tab updates
    window.dispatchEvent(new Event("storage_update"));
  },

  onUpdate: (callback: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("storage_update", callback);
    window.addEventListener("storage", callback); // Handles updates from other tabs
    return () => {
      window.removeEventListener("storage_update", callback);
      window.removeEventListener("storage", callback);
    };
  }
};

// Initial Demo Data Seed
export const seedDemoData = () => {
  if (storage.get("initialized")) return;

  // Period Timings
  storage.set("period_timings", [
    { id: "p1", name: "P1", startTime: "09:00", endTime: "09:50" },
    { id: "p2", name: "P2", startTime: "09:50", endTime: "10:40" },
    { id: "p3", name: "P3", startTime: "10:40", endTime: "11:30" },
    { id: "p4", name: "P4", startTime: "11:30", endTime: "12:20" },
  ]);

  // Classrooms
  storage.set("classrooms", [
    { id: "c1", name: "CSE-A", roomNumber: "302", department: "Computer Science", semester: "6th Sem" },
    { id: "c2", name: "CSE-B", roomNumber: "304", department: "Computer Science", semester: "6th Sem" },
    { id: "c3", name: "ECE-A", roomNumber: "101", department: "Electronics", semester: "4th Sem" },
    { id: "c4", name: "MECH-B", roomNumber: "G05", department: "Mechanical", semester: "8th Sem" },
  ]);

  // Users
  storage.set("users", {
    "admin-uid": { uid: "admin-uid", email: "admin@college.com", role: "admin", name: "Super Admin" },
    "cr-uid": { uid: "cr-uid", email: "cr@college.com", role: "cr", name: "John Doe", assignedClassroomId: "c1", assignedClassroomName: "CSE-A" }
  });

  // Timetable
  storage.set("timetable", {
    "c1_Monday": { 
      periods: [
        { periodId: "p1", subject: "DBMS", facultyName: "Dr. Ravi Shankar" },
        { periodId: "p2", subject: "Computer Networks", facultyName: "Prof. Sarah Jain" }
      ] 
    },
    "c2_Monday": {
      periods: [
        { periodId: "p1", subject: "Operating Systems", facultyName: "Prof. Amit Kumar" }
      ]
    }
  });

  storage.set("initialized", true);
};
