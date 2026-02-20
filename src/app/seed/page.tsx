'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { Alarm, Video, HistoryRecord } from '@/types';
import { subDays, format } from 'date-fns';
import Link from 'next/link';

export default function SeedPage() {
  const [status, setStatus] = useState('Initializing seed...');

  useEffect(() => {
    try {
      // 1. Clear existing data (optional, but cleaner for testing)
      localStorage.clear();

      // 2. Mock Video
      const videoId = 'S_GcZq9o_H4';
      const mockVideo: Video = {
        videoId,
        youtubeUrl: `https://www.youtube.com/shorts/${videoId}`,
        title: '신나는 1분 운동',
        channelName: '운동의 정석',
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
      storage.saveVideo(mockVideo);

      // 3. Mock 5 Alarms
      const titles = ['상체 근력 강화', '코어 밸런스', '아침 스트레칭', '하체 불태우기', '전신 유산소'];
      const times = ['07:00', '08:30', '18:00', '20:00', '22:30'];
      const alarms: Alarm[] = titles.map((title, i) => ({
        alarmId: `alarm-${i}`,
        videoId,
        title,
        daysOfWeek: [1, 2, 3, 4, 5], // 평일
        time: times[i],
        enabled: true,
      }));

      // Use lower level save to bypass addAlarm logic if needed, but storage has saveAlarms
      localStorage.setItem('workout_alarms', JSON.stringify(alarms));

      // 4. Mock History (Last 30 days)
      const history: HistoryRecord[] = [];
      const now = new Date();

      for (let i = 0; i < 30; i++) {
        const day = subDays(now, i);
        const dayStr = format(day, 'yyyy-MM-dd');

        // Randomly succeed with 70% probability
        alarms.forEach(alarm => {
          if (Math.random() > 0.3) {
            history.push({
              id: `hist-${i}-${alarm.alarmId}`,
              alarmId: alarm.alarmId,
              date: dayStr,
              timestamp: day.getTime() + (Math.random() * 3600000), // Random time within that day
            });
          }
        });
      }

      localStorage.setItem('workout_history', JSON.stringify(history));

      setStatus('Seed complete! 5 alarms and 30 days of history created.');
    } catch (error) {
      console.error(error);
      setStatus('Seed failed. Check console.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Seeding Data</h1>
      <p className="text-gray-600 mb-8">{status}</p>
      <div className="flex gap-4">
        <Link href="/" className="bg-black text-white px-6 py-3 rounded-xl font-medium">
          Go Home
        </Link>
        <Link href="/stats" className="bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-medium">
          View Stats
        </Link>
      </div>
    </div>
  );
}
