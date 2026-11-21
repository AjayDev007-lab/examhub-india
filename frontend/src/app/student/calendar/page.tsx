"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Download, Plus, Clock, MapPin, AlertCircle, CheckCircle2, 
  BookOpen, ExternalLink, Filter, X
} from "lucide-react";
import StudentNav from "@/components/StudentNav";
import { fetchApi } from "@/lib/api";

export default function StudentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"MONTH" | "WEEK" | "DAY">("MONTH");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");

  // Custom Event Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customType, setCustomType] = useState("EXAM_DATE");
  const [customDate, setCustomDate] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCalendarEvents();
  }, [eventTypeFilter]);

  async function loadCalendarEvents() {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      const params = new URLSearchParams();
      params.append("user_id", userId.toString());
      if (eventTypeFilter !== "ALL") params.append("event_type", eventTypeFilter);

      const res = await fetchApi(`/api/student/calendar/events?${params.toString()}`);
      if (res && res.events) {
        setEvents(res.events);
      }
    } catch (err) {
      console.error("Failed to load calendar events:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCustomEvent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      const payload = {
        title: customTitle.trim(),
        event_type: customType,
        event_date: new Date(customDate).toISOString(),
        location: customLocation.trim() || null,
        notes: customNotes.trim() || null
      };

      const res = await fetchApi(`/api/student/calendar/events?user_id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        setIsModalOpen(false);
        setCustomTitle("");
        setCustomDate("");
        setCustomLocation("");
        setCustomNotes("");
        loadCalendarEvents();
      }
    } catch (err: any) {
      alert("Failed to create event: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case "EXAM_DATE":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "APPLICATION_START":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "APPLICATION_END":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "ADMIT_CARD":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RESULT_DATE":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getEventsForDay = (dayNum: number) => {
    return events.filter((ev) => {
      const d = new Date(ev.event_date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === dayNum
      );
    });
  };

  // Calendar cells
  const calendarCells = [];
  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      dayNumber: daysInPrevMonth - i,
      isCurrentMonth: false,
      events: []
    });
  }
  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dayEvents = getEventsForDay(d);
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: true,
      events: dayEvents
    });
  }
  // Next month padding
  const totalSlots = Math.ceil(calendarCells.length / 7) * 7;
  let nextDay = 1;
  while (calendarCells.length < totalSlots) {
    calendarCells.push({
      dayNumber: nextDay++,
      isCurrentMonth: false,
      events: []
    });
  }

  // Upcoming milestones
  const upcomingEvents = [...events].sort(
    (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <StudentNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Automated Milestone Synchronization
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Personal Examination Calendar
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Synced with your registered national exams, hall ticket dates, and application closing deadlines.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <a
              href="/api/student/calendar/export.ics"
              download
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
              title="Download standard RFC 5545 iCalendar file for Google Calendar, Apple Calendar or Outlook"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export .ICS</span>
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Legend & Navigation Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Month Controls */}
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-black text-slate-900 min-w-44">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Event Filter & Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Exam Date</span>
            </span>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Deadline</span>
            </span>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Admit Card</span>
            </span>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1 focus:outline-none ml-2"
            >
              <option value="ALL">All Event Types</option>
              <option value="EXAM_DATE">Exam Dates Only</option>
              <option value="APPLICATION_END">Deadlines Only</option>
              <option value="ADMIT_CARD">Admit Card Releases</option>
            </select>
          </div>
        </div>

        {/* Calendar Grid View */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {calendarCells.map((cell, idx) => {
              const isToday =
                cell.isCurrentMonth &&
                new Date().getFullYear() === year &&
                new Date().getMonth() === month &&
                new Date().getDate() === cell.dayNumber;

              return (
                <div
                  key={idx}
                  className={`min-h-24 sm:min-h-28 p-2 flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth
                      ? "bg-white hover:bg-slate-50/60"
                      : "bg-slate-50/40 text-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? "bg-blue-600 text-white font-black shadow-sm"
                          : cell.isCurrentMonth
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-16 no-scrollbar">
                    {cell.events.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-bold border truncate transition-opacity hover:opacity-80 block ${getEventBadgeClass(
                          ev.event_type
                        )}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Milestones List */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-black text-slate-900">Upcoming Milestones & Reminders</h3>
            </div>
            <Link
              href="/student/my-exams"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>Manage Registered Exams</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {upcomingEvents.map((ev) => {
              const d = new Date(ev.event_date);
              const daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 3600 * 24));

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getEventBadgeClass(ev.event_type)}`}>
                      {ev.event_type.replace(/_/g, " ")}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ev.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                      <span>{d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-semibold text-blue-700">
                    {daysLeft > 0 ? `In ${daysLeft} days` : daysLeft === 0 ? "Today" : "Completed"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getEventBadgeClass(selectedEvent.event_type)}`}>
                  {selectedEvent.event_type.replace(/_/g, " ")}
                </span>
                <h3 className="font-black text-slate-900 text-base mt-1">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-900">
                  {new Date(selectedEvent.event_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.notes && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 italic">
                  "{selectedEvent.notes}"
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Calendar Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Add Calendar Milestone</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomEvent} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. UPSC CSE Mock Test 4 / Fee Payment"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Event Type</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  >
                    <option value="EXAM_DATE">Exam Date</option>
                    <option value="APPLICATION_END">Deadline</option>
                    <option value="ADMIT_CARD">Admit Card</option>
                    <option value="RESULT_DATE">Result Date</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="e.g. Online or Center Address"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Reminders or syllabus items..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
