'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { openYouTubeVideo } from '@/lib/deeplink';
import { Alarm, Video } from '@/types';

// 알람 목록 관리: F-01 CRUD
export default function AlarmsPage() {
  const [alarms, setAlarms] = useState<Array<{ alarm: Alarm; video: Video | null }>>([]);

  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = () => {
    const allAlarms = storage.getAlarms();
    const withVideos = allAlarms.map(alarm => ({
      alarm,
      video: storage.getVideo(alarm.videoId),
    }));
    setAlarms(withVideos);
  };

  const toggleAlarm = (alarmId: string, enabled: boolean) => {
    storage.updateAlarm(alarmId, { enabled });
    loadAlarms();
  };

  const deleteAlarm = (alarmId: string) => {
    if (!confirm('이 알람을 삭제하시겠습니까?')) return;
    storage.deleteAlarm(alarmId);
    loadAlarms();
  };

  const playVideo = (videoId: string) => {
    openYouTubeVideo(videoId);
  };

  const days = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-600">알람 관리</h1>
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← 홈으로
          </Link>
        </div>

        {alarms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">등록된 알람이 없습니다.</p>
            <Link
              href="/setup"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
            >
              알람 추가하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {alarms.map(({ alarm, video }) => (
              <div key={alarm.alarmId} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start gap-4">
                  {video && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg line-clamp-1">
                      {video?.title || '영상 정보 없음'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {alarm.daysOfWeek.map(d => days[d]).join(', ')} · {alarm.time}
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={alarm.enabled}
                      onChange={(e) => toggleAlarm(alarm.alarmId, e.target.checked)}
                      className="w-5 h-5"
                    />
                  </label>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => playVideo(alarm.videoId)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    ▶ 재생
                  </button>
                  <button
                    onClick={() => deleteAlarm(alarm.alarmId)}
                    className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
