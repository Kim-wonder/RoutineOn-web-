import { Alarm, Video } from '@/types';

// F-01, F-02: 로컬 저장 관리 (FSD 섹션 4)
const STORAGE_KEYS = {
  ALARMS: 'workout_alarms',
  VIDEOS: 'workout_videos',
  NOTIFICATIONS: 'workout_notifications',
};

export const storage = {
  // Alarms
  getAlarms(): Alarm[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ALARMS);
    return data ? JSON.parse(data) : [];
  },
  
  saveAlarms(alarms: Alarm[]): void {
    localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
  },
  
  addAlarm(alarm: Alarm): void {
    const alarms = this.getAlarms();
    alarms.push(alarm);
    this.saveAlarms(alarms);
  },
  
  updateAlarm(alarmId: string, updates: Partial<Alarm>): void {
    const alarms = this.getAlarms();
    const index = alarms.findIndex(a => a.alarmId === alarmId);
    if (index !== -1) {
      alarms[index] = { ...alarms[index], ...updates };
      this.saveAlarms(alarms);
    }
  },
  
  deleteAlarm(alarmId: string): void {
    const alarms = this.getAlarms().filter(a => a.alarmId !== alarmId);
    this.saveAlarms(alarms);
  },
  
  // Videos
  getVideos(): Video[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    return data ? JSON.parse(data) : [];
  },
  
  saveVideo(video: Video): void {
    const videos = this.getVideos();
    const existing = videos.findIndex(v => v.videoId === video.videoId);
    if (existing !== -1) {
      videos[existing] = video;
    } else {
      videos.push(video);
    }
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  },
  
  getVideo(videoId: string): Video | null {
    const videos = this.getVideos();
    return videos.find(v => v.videoId === videoId) || null;
  },
};
