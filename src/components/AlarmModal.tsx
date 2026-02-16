'use client';

import { useEffect } from 'react';
import { Video } from '@/types';

interface AlarmModalProps {
  isOpen: boolean;
  video: Video | null;
  onClose: () => void;
  onExecute: () => void;
}

export default function AlarmModal({ isOpen, video, onClose, onExecute }: AlarmModalProps) {
  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed Background */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-auto overflow-hidden animate-modal-appear">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-light tracking-tight text-black">운동 시간입니다</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <span className="text-gray-600 text-xl leading-none">×</span>
            </button>
          </div>
          <p className="text-sm text-gray-500">지금 바로 운동을 시작하세요!</p>
        </div>

        {/* Video Info */}
        {video && (
          <div className="px-6 pb-6">
            {/* Thumbnail */}
            {video.thumbnailUrl && (
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-56 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-black/80 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Video Details */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-black mb-1 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-sm text-gray-500">{video.channelName}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                나중에
              </button>
              <button
                onClick={onExecute}
                className="flex-1 bg-[#FF6B35] text-white py-4 rounded-xl font-medium hover:bg-[#FF5722] transition shadow-lg shadow-orange-500/30"
              >
                시작하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
