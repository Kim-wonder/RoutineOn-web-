'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
    >
      <div className="bg-white text-black px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-[90vw] border border-gray-200">
        <div className="w-1 h-8 bg-[#FF6B35] rounded-full"></div>
        <p className="font-medium text-sm flex-1">{message}</p>
        <button
          onClick={() => {
            setShow(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-black text-xl leading-none transition"
        >
          ×
        </button>
      </div>
    </div>
  );
}
