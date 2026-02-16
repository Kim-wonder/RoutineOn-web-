'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { extractVideoId, fetchVideoMetadata } from '@/lib/youtube';
import { storage } from '@/lib/storage';
import { Alarm, Video } from '@/types';
import Toast from '@/components/Toast';

// F-01: 운동 알람 생성, F-02: 유튜브 영상 링크 등록, F-03: 메타 정보 조회
export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: 요일/시간
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [time, setTime] = useState('07:00');

  // Step 2: 유튜브 링크
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [error, setError] = useState('');

  // Step 3: 메타 정보
  const [videoMeta, setVideoMeta] = useState<{
    title: string;
    channelName: string;
    thumbnailUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const daysKo = ['일', '월', '화', '수', '목', '금', '토'];

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleStep1Next = () => {
    if (selectedDays.length === 0) {
      showToastMessage('운동할 요일을 선택해주세요');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = async () => {
    setError('');

    // F-02: videoId 추출
    const id = extractVideoId(youtubeUrl);
    if (!id) {
      setError('유효한 유튜브 URL을 입력해주세요');
      return;
    }

    setVideoId(id);
    setLoading(true);

    // F-03: 메타 정보 조회
    const meta = await fetchVideoMetadata(id);
    setLoading(false);

    if (!meta) {
      // F-07: 영상 실행 실패 처리 (메타 조회 실패)
      setError('영상 정보를 불러올 수 없습니다');
      return;
    }

    setVideoMeta(meta);
    setStep(3);
  };

  const handleRegister = () => {
    if (!videoId || !videoMeta) return;

    // Video 저장
    const video: Video = {
      videoId,
      youtubeUrl,
      title: videoMeta.title,
      channelName: videoMeta.channelName,
      thumbnailUrl: videoMeta.thumbnailUrl,
    };
    storage.saveVideo(video);

    // Alarm 저장
    const alarm: Alarm = {
      alarmId: Date.now().toString(),
      videoId,
      daysOfWeek: selectedDays,
      time,
      enabled: true,
    };
    storage.addAlarm(alarm);

    showToastMessage('운동 알람이 등록되었습니다! 🎉');
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
    <>
      {/* 고정 Width 컨테이너 */}
      <div className="min-h-screen bg-[#F5F5F5] flex justify-center">
        <div className="w-full max-w-[480px] bg-[#F5F5F5] pb-20 relative">
          <Toast
            message={toastMessage}
            isVisible={showToast}
            onClose={() => setShowToast(false)}
          />

          {/* Header */}
          <header className="px-6 pt-16 pb-8">
            <div className="flex items-center justify-between mb-2">
              <Link href="/">
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <h1 className="text-2xl font-light tracking-tight text-black">ADD ROUTINE</h1>
              <div className="w-10"></div>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2 mt-6">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full transition ${s <= step ? 'bg-[#FF6B35]' : 'bg-[#E8E8E8]'
                    }`}
                />
              ))}
            </div>
          </header>

          <div className="px-6">
            {/* Step 1: 요일/시간 선택 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium text-black mb-4">운동 요일</h2>
                  <div className="flex gap-2">
                    {days.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleDay(idx)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition ${selectedDays.includes(idx)
                            ? 'bg-[#FF6B35] text-white'
                            : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-300'
                          }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-medium text-black mb-4">운동 시간</h2>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl text-2xl font-light text-black bg-white focus:outline-none focus:border-[#FF6B35] transition"
                  />
                </div>

                <button
                  onClick={handleStep1Next}
                  className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-900 transition mt-8"
                >
                  Next
                </button>
              </div>
            )}

            {/* Step 2: 유튜브 링크 입력 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium text-black mb-4">YouTube URL</h2>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-4 border border-gray-200 rounded-xl text-base text-black bg-white focus:outline-none focus:border-[#FF6B35] transition"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    * watch, shorts, youtu.be 링크 모두 지원
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStep2Next}
                    disabled={loading}
                    className="flex-1 bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-900 disabled:opacity-50 transition"
                  >
                    {loading ? 'Loading...' : 'Next'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: 영상 미리보기 */}
            {step === 3 && videoMeta && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  {/* 썸네일 */}
                  <div className="relative rounded-xl overflow-hidden bg-[#E8E8E8] mb-4">
                    <img
                      src={videoMeta.thumbnailUrl}
                      alt={videoMeta.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-black/80 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 영상 정보 */}
                  <h3 className="font-medium text-lg text-black mb-1 line-clamp-2">
                    {videoMeta.title}
                  </h3>
                  <p className="text-sm text-gray-500">{videoMeta.channelName}</p>
                </div>

                {/* 설정 요약 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-[#FF6B35] rounded-full"></div>
                    <h3 className="font-medium text-black">Schedule</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium text-black">Days:</span> {selectedDays.map(d => daysKo[d]).join(', ')}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium text-black">Time:</span> {time}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleRegister}
                    className="flex-1 bg-[#FF6B35] text-white py-4 rounded-xl font-medium hover:bg-[#FF5722] transition shadow-lg shadow-orange-500/30"
                  >
                    Register
                  </button>
                </div>
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
