"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface PeriodEntry {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  subject: string;
  facultyName: string;
}

export const usePeriodEngine = (classroomId?: string) => {
  const [activePeriod, setActivePeriod] = useState<PeriodEntry | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[currentTime.getDay()];
  };

  const currentDay = getCurrentDay();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!classroomId) {
      setActivePeriod(null);
      return;
    }

    const checkActive = async () => {
      const { data: scheduleData } = await supabase
        .from("master_schedules")
        .select("periods")
        .eq("classroom_id", classroomId)
        .eq("day", currentDay)
        .single();

      const schedule = scheduleData?.periods || [];
      const nowTotal = currentTime.getHours() * 60 + currentTime.getMinutes();

      const active = schedule.find((p: any) => {
        const [startH, startM] = p.startTime.split(":").map(Number);
        const [endH, endM] = p.endTime.split(":").map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        return nowTotal >= startTotal && nowTotal < endTotal;
      });

      setActivePeriod(active || null);
    };

    checkActive();

    const channel = supabase
      .channel(`engine_${classroomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "master_schedules", filter: `classroom_id=eq.${classroomId}` }, checkActive)
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [classroomId, currentDay, currentTime]);

  return {
    activePeriod,
    currentTime,
    currentDay,
  };
};
