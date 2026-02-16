// F-01, F-02, F-03: 데이터 정의 (FSD 섹션 4)
export interface Video {
  videoId: string;
  youtubeUrl: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
}

export interface Alarm {
  alarmId: string;
  videoId: string;
  daysOfWeek: number[]; // 0=일요일, 1=월요일, ...
  time: string; // "HH:mm" 형식
  enabled: boolean;
}

export interface NotificationEvent {
  alarmId: string;
  videoId: string;
  triggeredAt: Date;
  acknowledged: boolean;
  retryCount: number; // F-06: 재알림 카운트
}
