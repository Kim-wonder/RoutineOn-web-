import { Alarm } from '@/types';
import { parse, isAfter, isBefore, addDays, startOfDay, set } from 'date-fns';

// F-04, F-09: 알림 스케줄링 로직
export function getNextAlarm(alarms: Alarm[]): {
  alarm: Alarm;
  nextTrigger: Date;
} | null {
  const now = new Date();
  const activeAlarms = alarms.filter(a => a.enabled);
  
  if (activeAlarms.length === 0) return null;
  
  let closestAlarm: Alarm | null = null;
  let closestTime: Date | null = null;
  
  for (const alarm of activeAlarms) {
    const [hours, minutes] = alarm.time.split(':').map(Number);
    const currentDay = now.getDay();
    
    // 오늘 포함 7일 범위에서 가장 가까운 알림 찾기
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDay = (currentDay + dayOffset) % 7;
      
      if (!alarm.daysOfWeek.includes(targetDay)) continue;
      
      const targetDate = addDays(startOfDay(now), dayOffset);
      const targetTime = set(targetDate, { hours, minutes, seconds: 0 });
      
      // 오늘이면서 이미 지난 시간은 제외
      if (dayOffset === 0 && isBefore(targetTime, now)) continue;
      
      if (!closestTime || isBefore(targetTime, closestTime)) {
        closestTime = targetTime;
        closestAlarm = alarm;
      }
    }
  }
  
  if (!closestAlarm || !closestTime) return null;
  
  return {
    alarm: closestAlarm,
    nextTrigger: closestTime,
  };
}
