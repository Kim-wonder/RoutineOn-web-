'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { extractVideoId, fetchVideoMetadata } from '@/lib/youtube';
import { storage } from '@/lib/storage';
import { Alarm, Video } from '@/types';
import Toast from '@/components/Toast';
import BottomNav from '@/components/BottomNav';


function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [step, setStep] = useState(1);

  // Step 1: 요일/시간
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [time, setTime] = useState('07:00');
  const [title, setTitle] = useState('');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);


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

  // Init for Edit mode
  useEffect(() => {
    if (editId) {
      const alarm = storage.getAlarm(editId);
      if (alarm) {
        setSelectedDays(alarm.daysOfWeek);
        setTime(alarm.time);
        setTitle(alarm.title);
        setVideoId(alarm.videoId);

        const video = storage.getVideo(alarm.videoId);
        if (video) {
          setYoutubeUrl(video.youtubeUrl);
          setVideoMeta({
            title: video.title,
            channelName: video.channelName,
            thumbnailUrl: video.thumbnailUrl
          });
        }
      }
    }
  }, [editId]);

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
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
    if (!title.trim()) {
      showToastMessage('루틴 이름을 입력해주세요');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = async () => {
    setError('');

    const id = extractVideoId(youtubeUrl);
    if (!id) {
      setError('유효한 유튜브 URL을 입력해주세요');
      return;
    }

    setVideoId(id);
    setLoading(true);

    const meta = await fetchVideoMetadata(id);
    setLoading(false);

    if (!meta) {
      setError('영상 정보를 불러올 수 없습니다');
      return;
    }

    setVideoMeta(meta);
    setStep(3);
  };

  const handleDelete = () => {
    if (!editId) return;
    if (confirm('이 알람을 삭제하시겠습니까?')) {
      storage.deleteAlarm(editId);
      showToastMessage('알람이 삭제되었습니다');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  };

  const handleRegisterOrUpdate = () => {
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

    if (editId) {
      // Alarm 수정
      storage.updateAlarm(editId, {
        videoId,
        title: title.trim(),
        daysOfWeek: selectedDays,
        time,
      });
      showToastMessage('루틴이 성공적으로 수정되었습니다! ✨');
    } else {
      // Alarm 신규 저장
      const alarm: Alarm = {
        alarmId: Date.now().toString(),
        videoId,
        title: title.trim(),
        daysOfWeek: selectedDays,
        time,
        enabled: true,
      };
      storage.addAlarm(alarm);
      showToastMessage('운동 루틴이 등록되었습니다! 🎉');
    }

    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
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
            <h1 className="text-2xl font-light tracking-tight text-black uppercase">
              {editId ? 'Edit Routine' : 'Add Routine'}
            </h1>
            <div className="w-10"></div>
          </div>

          <div className="flex gap-2 mt-6">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition ${s <= step ? 'bg-[#FF6B35]' : 'bg-[#E8E8E8]'}`}
              />
            ))}
          </div>
        </header>

        <div className="px-6">
          {/* Step 1: 요일/시간 선택 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-medium text-black mb-4">루틴 이름</h2>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 아침 스트레칭, 요가 한 판"
                  className="w-full py-2.5 px-4 border border-gray-200 rounded-xl text-base text-black bg-white focus:outline-none focus:border-[#FF6B35] transition"
                />
              </div>

              <div>
                <h2 className="text-xl font-medium text-black mb-4">운동 요일</h2>
                <div className="flex gap-2">
                  {days.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleDay(idx)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-medium font-medium transition ${selectedDays.includes(idx)
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <h2 className="text-xl font-medium text-black mb-4">운동 시간</h2>
                <div
                  onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                  className="w-full py-4 px-4 border border-gray-200 rounded-xl flex items-center justify-between cursor-pointer bg-white hover:border-gray-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-light text-2xl">
                      {parseInt(time.split(':')[0]) < 12 ? '오전' : '오후'}
                    </span>
                    <span className="text-3xl font-light text-black">
                      {(() => {
                        const [h, m] = time.split(':').map(Number);
                        const displayH = h % 12 || 12;
                        return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                      })()}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                {/* Custom Time Picker Dropdown */}
                {isTimePickerOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-4 flex gap-2">
                    {/* AM/PM */}
                    <div className="flex-1 space-y-1">
                      {['오전', '오후'].map(period => (
                        <button
                          key={period}
                          onClick={() => {
                            const [h, m] = time.split(':').map(Number);
                            let newH = h;
                            if (period === '오전' && h >= 12) newH -= 12;
                            if (period === '오후' && h < 12) newH += 12;
                            setTime(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                          }}
                          className={`w-full py-2 rounded-lg text-sm font-medium transition ${(period === '오전' && parseInt(time.split(':')[0]) < 12) ||
                            (period === '오후' && parseInt(time.split(':')[0]) >= 12)
                            ? 'bg-[#FF6B35] text-white'
                            : 'text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>

                    {/* Hour */}
                    <div className="flex-1 h-48 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
                        const currentH = parseInt(time.split(':')[0]);
                        const isPM = currentH >= 12;
                        const actualH = isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
                        const isSelected = (currentH % 12 || 12) === h;

                        return (
                          <button
                            key={h}
                            onClick={() => {
                              const m = time.split(':')[1];
                              setTime(`${actualH.toString().padStart(2, '0')}:${m}`);
                            }}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition ${isSelected ? 'bg-[#FF6B35] text-white' : 'text-gray-400 hover:bg-gray-50'
                              }`}
                          >
                            {h.toString().padStart(2, '0')}
                          </button>
                        );
                      })}
                    </div>

                    {/* Minute */}
                    <div className="flex-1 h-48 overflow-y-auto custom-scrollbar space-y-1">
                      {Array.from({ length: 60 }, (_, i) => i).map(m => {
                        const currentM = parseInt(time.split(':')[1]);
                        const isSelected = currentM === m;
                        return (
                          <button
                            key={m}
                            onClick={() => {
                              const h = time.split(':')[0];
                              setTime(`${h}:${m.toString().padStart(2, '0')}`);
                            }}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition ${isSelected ? 'bg-[#FF6B35] text-white' : 'text-gray-400 hover:bg-gray-50'
                              }`}
                          >
                            {m.toString().padStart(2, '0')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleStep1Next}
                className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-900 transition mt-8"
              >
                Next
              </button>

              {editId && (
                <button
                  onClick={handleDelete}
                  className="w-full bg-white border border-gray-200 text-red-500 py-4 rounded-xl font-medium hover:bg-red-50 transition mt-4"
                >
                  Delete Routine
                </button>
              )}
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
                  className="w-full py-2.5 px-4 border border-gray-200 rounded-xl text-base text-black bg-white focus:outline-none focus:border-[#FF6B35] transition"
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

                <h3 className="font-medium text-lg text-black mb-1 line-clamp-2">
                  {videoMeta.title}
                </h3>
                <p className="text-sm text-gray-500">{videoMeta.channelName}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-[#FF6B35] rounded-full"></div>
                  <h3 className="font-medium text-black">Summary</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium text-black">Routine:</span> {title}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-black">Schedule:</span> {selectedDays.map(d => daysKo[d]).join(', ')} @ {time}
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
                  onClick={handleRegisterOrUpdate}
                  className="flex-1 bg-[#FF6B35] text-white py-4 rounded-xl font-medium hover:bg-[#FF5722] transition shadow-lg shadow-orange-500/30"
                >
                  {editId ? 'Update' : 'Register'}
                </button>
              </div>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SetupForm />
    </Suspense>
  );
}
