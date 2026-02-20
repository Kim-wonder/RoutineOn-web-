'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Alarm, HistoryRecord } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import BottomNav from '@/components/BottomNav';

export default function StatsPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setHistory(storage.getHistory());
    setAlarms(storage.getAlarms());
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthlyHistory = history.filter(h => {
    const d = new Date(h.timestamp);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  const getSuccessForDay = (date: Date) => {
    return monthlyHistory.filter(h => isSameDay(new Date(h.timestamp), date));
  };

  const getScheduledCountForDay = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
    return alarms.filter(a => a.enabled && a.daysOfWeek.includes(dayOfWeek)).length;
  };

  const selectedDayScheduled = selectedDate
    ? alarms.filter(a => a.enabled && a.daysOfWeek.includes(selectedDate.getDay()))
    : [];

  const selectedDayHistory = selectedDate
    ? history.filter(h => isSameDay(new Date(h.timestamp), selectedDate))
    : [];

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex justify-center">
      <div className="w-full max-w-[480px] bg-[#F5F5F5] pb-32 relative">
        <header className="px-6 pt-16 pb-8">
          <h1 className="text-3xl font-light tracking-tight text-black mb-2">STATS</h1>
          <p className="text-sm text-gray-500 font-light">
            {format(currentDate, 'MMMM yyyy')}
          </p>
        </header>

        <div className="px-6 space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Monthly Success</p>
                <h2 className="text-4xl font-light text-black">
                  {monthlyHistory.length} <span className="text-lg text-gray-400">Times</span>
                </h2>
              </div>
              <div className="w-16 h-16 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-black mb-4">Activity Heatmap</h3>
            <div className="grid grid-cols-7 gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-gray-300 py-1">
                  {d}
                </div>
              ))}
              {/* Padding for start of month */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {daysInMonth.map((day, i) => {
                const successes = getSuccessForDay(day);
                const scheduled = getScheduledCountForDay(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                // Calculate unique scheduled alarm IDs completed today
                const completedUniqueIds = new Set(successes.map(h => h.alarmId));
                const scheduledAlarmsForDay = alarms.filter(a => a.enabled && a.daysOfWeek.includes(day.getDay()));

                // Final ratio: How many of the scheduled routine IDs were actually done
                const completedCount = scheduledAlarmsForDay.filter(a => completedUniqueIds.has(a.alarmId)).length;
                const ratio = scheduled > 0 ? Math.min(completedCount / scheduled, 1) : 0;

                // Heatmap Background: Using variable opacity
                const backgroundColor = isSelected
                  ? '#000000'
                  : ratio > 0
                    ? `rgba(255, 107, 53, ${0.1 + ratio * 0.9})`
                    : 'transparent';

                const textColor = isSelected || ratio > 0.6
                  ? '#FFFFFF'
                  : isToday
                    ? '#FF6B35'
                    : '#9CA3AF';

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className="aspect-square flex flex-col items-center justify-center relative hover:bg-gray-50 rounded-lg transition"
                  >
                    <div
                      style={{ backgroundColor }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition ${isSelected
                        ? 'ring-4 ring-black/10'
                        : isToday && !isSelected && ratio === 0
                          ? 'border border-[#FF6B35]'
                          : ''
                        }`}
                    >
                      <span style={{ color: textColor }}>{format(day, 'd')}</span>
                    </div>
                    {/* Tiny indicator for selection active if day had success */}
                    {isSelected && ratio > 0 && (
                      <div className="absolute bottom-1 w-1 h-1 bg-[#FF6B35] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            {/* Heatmap Legend */}
            <div className="mt-6 flex items-center justify-end gap-2 text-[10px] text-gray-400">
              <span>Low</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: `rgba(255, 107, 53, ${0.1 + r * 0.9})` }}
                  />
                ))}
              </div>
              <span>Full</span>
            </div>
          </div>

          {/* Recent History - Interactive */}
          {selectedDate && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-black">
                  Log for {format(selectedDate, 'MMM d, yyyy')}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[10px] text-gray-400 hover:text-black"
                >
                  Close
                </button>
              </div>

              {selectedDayScheduled.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                  <p className="text-sm text-gray-400">No routines scheduled for this day</p>
                </div>
              ) : (
                selectedDayScheduled
                  .slice()
                  .sort((a, b) => {
                    const aSuccess = selectedDayHistory.some(h => h.alarmId === a.alarmId);
                    const bSuccess = selectedDayHistory.some(h => h.alarmId === b.alarmId);
                    if (aSuccess === bSuccess) return 0;
                    return aSuccess ? -1 : 1;
                  })
                  .map((alarm) => {
                    const execution = selectedDayHistory.find(h => h.alarmId === alarm.alarmId);
                    const isSuccess = !!execution;

                    return (
                      <div key={alarm.alarmId} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-200">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className={`text-sm font-medium transition ${isSuccess ? 'text-black' : 'text-gray-400'}`}>
                            {alarm.title}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {alarm.time} {isSuccess && `· Executed at ${format(new Date(execution.timestamp), 'h:mm a')}`}
                          </p>
                        </div>

                        {isSuccess ? (
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-300">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 opacity-50">
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </div>



        <BottomNav />
      </div>
    </div>
  );
}
