'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { getNextAlarm } from '@/lib/scheduler';
import { openYouTubeVideo } from '@/lib/deeplink';
import { Alarm } from '@/types';

// F-04: 로컬 알림 발송, F-06: 재알림 기능
export default function NotificationManager() {
  const [notification, setNotification] = useState<{
    alarm: Alarm;
    message: string;
    retryCount: number;
  } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // F-08: 알림 권한 관리
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setPermissionGranted(permission === 'granted');
        });
      }
    }
  }, []);

  // 알림 스케줄링 (모의 구현: 1분마다 체크)
  useEffect(() => {
    const interval = setInterval(() => {
      const alarms = storage.getAlarms();
      const next = getNextAlarm(alarms);

      if (!next) return;

      const now = new Date();
      const timeDiff = next.nextTrigger.getTime() - now.getTime();

      // 1분 이내에 알림이 있으면 발송
      if (timeDiff > 0 && timeDiff < 60000) {
        triggerNotification(next.alarm);
      }
    }, 10000); // 10초마다 체크 (테스트용)

    return () => clearInterval(interval);
  }, []);

  const triggerNotification = (alarm: Alarm) => {
    const message = "운동할 시간이에요 💪 지금 시작해볼까요?";

    // 브라우저 알림 시도
    if (permissionGranted && 'Notification' in window) {
      const n = new Notification('운동 알람', {
        body: message,
        icon: '/icon.png',
        tag: alarm.alarmId,
      });

      n.onclick = () => {
        const video = storage.getVideo(alarm.videoId);
        if (video) {
          openYouTubeVideo(video.videoId);
          setNotification(null);
        }
      };
    }

    // 앱 내 알림 카드 표시
    setNotification({ alarm, message, retryCount: 0 });

    // F-06: 재알림 (5분 간격, 최대 3회)
    scheduleRetry(alarm, 0);
  };

  const scheduleRetry = (alarm: Alarm, count: number) => {
    if (count >= 3) return;

    setTimeout(() => {
      if (notification && notification.alarm.alarmId === alarm.alarmId) {
        setNotification(prev => prev ? { ...prev, retryCount: count + 1 } : null);
        scheduleRetry(alarm, count + 1);
      }
    }, 5 * 60 * 1000); // 5분
  };

  const handleNotificationClick = () => {
    if (!notification) return;
    const video = storage.getVideo(notification.alarm.videoId);
    if (video) {
      openYouTubeVideo(video.videoId);
      setNotification(null);
    }
  };

  if (!notification) return null;

  return null;
}
