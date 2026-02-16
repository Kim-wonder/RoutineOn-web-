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
    showToastMessage('수정 기능은 곧 추가됩니다');
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
        <div className="w-full max-w-[480px] bg-[#F5F5F5] pb-20 relative">
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
          <header className="px-6 pt-16 pb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-light tracking-tight text-black">ROUTINE</h1>
              <Link
                href="/setup"
                className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center hover:bg-[#FF5722] transition shadow-sm"
              >
                <span className="text-white text-2xl font-light leading-none">+</span>
              </Link>
            </div>
            {nextAlarm && (
              <p className="text-sm text-gray-500 font-light">
                {formatDate(nextAlarm.nextTrigger)}
              </p>
            )}
          </header>

          <div className="px-6 space-y-4">
            {/* 요일 선택 표시 */}
            {nextAlarm && (
              <div className="flex gap-2 mb-6">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition ${nextAlarm.alarm.daysOfWeek.includes(idx)
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-[#E8E8E8] text-gray-400'
                      }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            )}

            {/* 메인 알람 카드 또는 빈 상태 */}
            {nextAlarm ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                {/* 체크박스와 제목 */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-medium text-black mb-1">
                      {nextAlarm.video?.title || 'Watch Workout Video'}
                    </h2>
                    {nextAlarm.video && (
                      <p className="text-sm text-gray-500">{nextAlarm.video.channelName}</p>
                    )}
                  </div>
                </div>

                {/* 영상 썸네일 */}
                {nextAlarm.video?.thumbnailUrl && (
                  <div className="relative rounded-xl overflow-hidden bg-[#E8E8E8] mb-4">
                    <img
                      src={nextAlarm.video.thumbnailUrl}
                      alt={nextAlarm.video.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-black/80 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* 실행 버튼 */}
                <button
                  onClick={handlePlayNow}
                  className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-900 transition"
                >
                  EXECUTE NOW
                </button>
              </div>
            ) : (
              <Link href="/setup">
                <div className="bg-white rounded-2xl p-16 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition shadow-sm border border-gray-200">
                  <div className="text-center">
                    <div className="text-sm font-light text-gray-400 tracking-widest">ADD ROUTINE</div>
                  </div>
                </div>
              </Link>
            )}

            {/* 알람 리스트 */}
            {allAlarms.length > 0 && (
              <div className="space-y-3 pt-4">
                {allAlarms.map((alarm) => {
                  const video = storage.getVideo(alarm.videoId);
                  return (
                    <div
                      key={alarm.alarmId}
                      className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-200 relative"
                    >
                      {/* 체크박스 */}
                      <button
                        onClick={() => toggleAlarm(alarm.alarmId)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition ${alarm.enabled
                            ? 'bg-black'
                            : 'bg-white border-2 border-gray-300'
                          }`}
                      >
                        {alarm.enabled && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className={`text-base font-medium mb-0.5 ${alarm.enabled ? 'text-black' : 'text-gray-400 line-through'}`}>
                          {video?.title || 'Workout Routine'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTime(alarm.time)} · {getDayLabel(alarm.daysOfWeek)}
                        </div>
                      </div>

                      {/* 더보기 메뉴 */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === alarm.alarmId ? null : alarm.alarmId)}
                          className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center hover:bg-[#E8E8E8] transition"
                        >
                          <span className="text-gray-600 text-lg">⋯</span>
                        </button>

                        {openMenuId === alarm.alarmId && (
                          <div className="absolute right-0 top-10 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10 min-w-[100px]">
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-around max-w-md mx-auto">
              <Link href="/" className="text-xs font-medium text-gray-400 hover:text-black transition">
                HOME
              </Link>
              <Link href="/setup" className="text-xs font-medium text-[#FF6B35] hover:text-[#FF5722] transition">
                ROUTINE
              </Link>
              <Link href="/stats" className="text-xs font-medium text-gray-400 hover:text-black transition">
                STATS
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
