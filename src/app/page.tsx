'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { getNextAlarm } from '@/lib/scheduler';
import { openYouTubeVideo } from '@/lib/deeplink';
import { Alarm, Video } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import NotificationManager from '@/components/NotificationManager';
import Toast from '@/components/Toast';
import AlarmModal from '@/components/AlarmModal';
import BottomNav from '@/components/BottomNav';


// Home 화면: F-09 알림 시간 경과 후 앱 실행 처리
export default function HomePage() {
  const [nextAlarm, setNextAlarm] = useState<{ alarm: Alarm; nextTrigger: Date; video: Video | null } | null>(null);
  const [todayVideo, setTodayVideo] = useState<Video | null>(null);
  const [allAlarms, setAllAlarms] = useState<Alarm[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);

  useEffect(() => {
    loadData();
    checkAlarmTime();

    // 1분마다 알람 시간 체크
    const interval = setInterval(checkAlarmTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const alarms = storage.getAlarms();
    setAllAlarms(alarms);
    const next = getNextAlarm(alarms);

    if (next) {
      const video = storage.getVideo(next.alarm.videoId);
      setNextAlarm({ ...next, video });
      setTodayVideo(video);
    } else {
      setNextAlarm(null);
      setTodayVideo(null);
    }
  };

  const checkAlarmTime = () => {
    const alarms = storage.getAlarms();
    const next = getNextAlarm(alarms);

    if (next) {
      const now = new Date();
      const timeDiff = next.nextTrigger.getTime() - now.getTime();

      // 알람 시간이 되었거나 1분 이내라면 모달 표시
      if (timeDiff <= 60000 && timeDiff >= 0) {
        const video = storage.getVideo(next.alarm.videoId);
        setTodayVideo(video);
        setShowAlarmModal(true);
      }
    }
  };

  const handlePlayNow = () => {
    if (!todayVideo) return;

    try {
      openYouTubeVideo(todayVideo.videoId);

      // 성공 기록 저장 (F-11)
      if (nextAlarm) {
        storage.addHistory({
          id: Date.now().toString(),
          alarmId: nextAlarm.alarm.alarmId,
          date: format(new Date(), 'yyyy-MM-dd'),
          timestamp: Date.now(),
        });
      }

      setShowAlarmModal(false);
      showToastMessage('운동 영상을 시작합니다');
    } catch (error) {

      showToastMessage('영상 실행에 실패했습니다');
    }
  };

  const toggleAlarm = (alarmId: string) => {
    const alarm = allAlarms.find(a => a.alarmId === alarmId);
    if (alarm) {
      storage.updateAlarm(alarmId, { enabled: !alarm.enabled });
      loadData();
      showToastMessage(alarm.enabled ? '알람 비활성화' : '알람 활성화');
    }
  };

  const handleDeleteAlarm = (alarmId: string) => {
    if (confirm('이 알람을 삭제하시겠습니까?')) {
      storage.deleteAlarm(alarmId);
      loadData();
      setOpenMenuId(null);
      showToastMessage('알람이 삭제되었습니다');
    }
  };

  const handleEditAlarm = (alarmId: string) => {
    window.location.href = `/setup?edit=${alarmId}`;
    setOpenMenuId(null);
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const getDayLabel = (days: number[]) => {
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    if (days.length === 7) return 'Every day';
    if (days.length === 0) return '';
    return days.map(d => dayNames[d]).join(' ');
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMMM d, yyyy - h:mma', { locale: ko });
  };

  return (
    <>
      {/* 고정 Width 컨테이너 */}
      <div className="min-h-screen bg-[#F5F5F5] flex justify-center">
        <div className="w-full max-w-[480px] bg-[#F5F5F5] pb-32 relative">
          <NotificationManager />
          <Toast
            message={toastMessage}
            isVisible={showToast}
            onClose={() => setShowToast(false)}
          />

          {/* 알림 모달 */}
          <AlarmModal
            isOpen={showAlarmModal}
            video={todayVideo}
            onClose={() => setShowAlarmModal(false)}
            onExecute={handlePlayNow}
          />

          {/* Header */}
          <header className="px-6 pt-16 pb-8 text-center relative">
            <h1 className="text-3xl font-light tracking-tight text-black">ROUTINES</h1>
            <p className="text-sm text-gray-500 font-light mt-1 text-center">Manage your workout schedule</p>
            <div className="absolute right-6 top-16">
              <Link
                href="/setup"
                className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center hover:bg-[#FF5722] transition shadow-sm"
              >
                <span className="text-white text-2xl font-light">+</span>
              </Link>
            </div>
          </header>

          <div className="px-6 space-y-4">
            {allAlarms.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
                <p className="text-gray-400 mb-6 font-light">No routines registered yet.</p>
                <Link
                  href="/setup"
                  className="inline-block bg-[#FF6B35] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#FF5722] transition shadow-lg shadow-orange-500/20"
                >
                  Create Routine
                </Link>
              </div>
            ) : (
              allAlarms.map((alarm) => {
                const video = storage.getVideo(alarm.videoId);
                const daysKo = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

                return (
                  <div key={alarm.alarmId} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${alarm.enabled ? 'bg-[#FF6B35]/10 text-[#FF6B35]' : 'bg-gray-100 text-gray-300'}`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className={`font-medium text-lg leading-tight transition ${alarm.enabled ? 'text-black' : 'text-gray-300'}`}>
                            {alarm.title}
                          </h3>
                          <p className="text-[12px] text-gray-400 font-medium">
                            {alarm.time} · {alarm.daysOfWeek.map(d => daysKo[d]).join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Top Right: More Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === alarm.alarmId ? null : alarm.alarmId)}
                          className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center hover:bg-[#E8E8E8] transition"
                        >
                          <span className="text-gray-600 text-lg">⋯</span>
                        </button>

                        {openMenuId === alarm.alarmId && (
                          <div className="absolute right-0 top-10 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20 min-w-[100px]">
                            <button
                              onClick={() => handleEditAlarm(alarm.alarmId)}
                              className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-[#F5F5F5] transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAlarm(alarm.alarmId)}
                              className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#FF6B35] hover:bg-red-50 transition"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {video && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-16 h-10 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] text-gray-400 font-medium mb-0.5 uppercase tracking-wider">Video</p>
                            <p className="text-xs text-gray-600 line-clamp-1 truncate">{video.title}</p>
                          </div>
                        </div>

                        {/* Toggle Switch moved here */}
                        <button
                          onClick={() => toggleAlarm(alarm.alarmId)}
                          className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${alarm.enabled ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${alarm.enabled ? 'left-5.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Navigation */}
          <BottomNav />

        </div>
      </div>
    </>
  );
}
