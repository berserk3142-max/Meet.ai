"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Zap, FileText, BarChart3 } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SAMPLE_EVENTS = [
    { day: 5, title: "Design Review", color: "#8B5CF6" },
    { day: 10, title: "Sprint Demo", color: "#a3e635" },
    { day: 15, title: "Client Call", color: "#EAB308" },
    { day: 20, title: "Team Retro", color: "#EC4899" },
    { day: 25, title: "1:1 Meeting", color: "#22d3ee" },
];

export default function SchedulePage() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const todayDate = today.getDate();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    const monthName = new Date(currentYear, currentMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const calendarCells = useMemo(() => {
        const cells: (number | null)[] = [];
        for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
        for (let i = 1; i <= daysInMonth; i++) cells.push(i);
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    }, [firstDayOfWeek, daysInMonth]);

    const goToPrevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else setCurrentMonth(currentMonth - 1);
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else setCurrentMonth(currentMonth + 1);
    };

    return (
        <div className="p-8 lg:p-12">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tight uppercase">
                    Schedule
                </h1>
                <p className="text-gray-400 text-lg font-medium border-l-4 border-[#EC4899] pl-3 mt-3">
                    Manage your calendar and upcoming events.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-3 bg-black border-[3px] border-white p-8 shadow-neo-purple relative">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">
                            {monthName}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}
                                className="px-4 py-2 bg-[#8B5CF6] text-white text-xs font-black uppercase tracking-wider border-2 border-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                                Today
                            </button>
                            <button onClick={goToPrevMonth} className="w-10 h-10 bg-black border-2 border-white flex items-center justify-center hover:bg-[#111] transition-colors shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]">
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <button onClick={goToNextMonth} className="w-10 h-10 bg-black border-2 border-white flex items-center justify-center hover:bg-[#111] transition-colors shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]">
                                <ChevronRight className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b-[3px] border-white">
                        {DAYS.map((day) => (
                            <div key={day} className="text-center py-3 text-gray-400 font-black text-xs uppercase tracking-widest border-r-2 border-white/10 last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7">
                        {calendarCells.map((day, index) => {
                            const isToday = isCurrentMonth && day === todayDate;
                            const event = day ? SAMPLE_EVENTS.find(e => e.day === day) : null;

                            return (
                                <div
                                    key={index}
                                    className={`min-h-[80px] p-2 border-r-2 border-b-2 border-white/10 relative transition-colors hover:bg-[#111]/50 cursor-pointer ${!day ? "bg-[#050505]" : ""
                                        } ${isToday ? "bg-[#8B5CF6]/10" : ""}`}
                                >
                                    {day && (
                                        <>
                                            <span className={`text-sm font-bold ${isToday
                                                    ? "bg-[#8B5CF6] text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-neo-sm"
                                                    : "text-gray-400"
                                                }`}>
                                                {day}
                                            </span>
                                            {event && (
                                                <div
                                                    className="mt-1 px-1.5 py-0.5 text-[10px] font-black text-black border border-white truncate"
                                                    style={{ backgroundColor: event.color }}
                                                >
                                                    {event.title}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#111] border-[3px] border-white shadow-neo p-6">
                        <h3 className="text-lg font-display font-bold text-white uppercase mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#a3e635] rounded-full animate-pulse"></span>
                            Upcoming
                        </h3>
                        <div className="space-y-3">
                            {SAMPLE_EVENTS.slice(0, 3).map((event, i) => (
                                <div
                                    key={i}
                                    className="p-3 border-2 border-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-neo-sm transition-all cursor-pointer"
                                    style={{ borderLeftWidth: "4px", borderLeftColor: event.color }}
                                >
                                    <div className="font-bold text-white text-sm">{event.title}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-1">
                                        {new Date(currentYear, currentMonth, event.day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#111] border-[3px] border-white shadow-neo p-6">
                        <h3 className="text-lg font-display font-bold text-white uppercase mb-4">Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm font-bold flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-[#EAB308]" /> Meetings
                                </span>
                                <span className="text-white font-black text-lg">12</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm font-bold flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#a3e635]" /> AI Notes
                                </span>
                                <span className="text-white font-black text-lg">8</span>
                            </div>
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-xs font-bold flex items-center gap-2">
                                        <BarChart3 className="w-3 h-3 text-[#8B5CF6]" /> Efficiency
                                    </span>
                                    <span className="text-[#8B5CF6] font-black text-sm">87%</span>
                                </div>
                                <div className="w-full h-3 bg-[#222] border-2 border-white overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] w-[87%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAB */}
            <button className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#a3e635] border-2 border-white shadow-neo flex items-center justify-center hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                <Plus className="w-6 h-6 text-black group-hover:rotate-90 transition-transform" />
            </button>
        </div>
    );
}
