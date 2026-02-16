# 운동알람 (workOut_alarm) - 웹 프로토타입

유튜브 운동 영상과 연동된 알람 앱의 웹 기반 프로토타입입니다.

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📋 주요 기능

- ✅ 운동 알람 생성 (요일/시간 선택)
- ✅ 유튜브 영상 링크 등록
- ✅ 영상 메타 정보 자동 조회
- ✅ 브라우저 알림 (권한 허용 시)
- ✅ 딥링크를 통한 유튜브 앱 실행
- ✅ 재알림 기능 (5분 간격, 최대 3회)
- ✅ 알람 관리 (ON/OFF, 삭제)

## 🧪 테스트 시나리오

1. **알람 등록**: 홈 → SET WORK OUT → 요일/시간 선택 → 유튜브 URL 입력 → 등록
2. **다음 알림 확인**: 홈 화면에서 가장 가까운 알림 시간 확인
3. **영상 재생**: "지금 시작하기" 버튼으로 유튜브 영상 실행
4. **알람 관리**: 알람 관리 페이지에서 ON/OFF 토글 및 삭제

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx          # 홈 화면
│   ├── setup/page.tsx    # 알람 설정 플로우
│   ├── alarms/page.tsx   # 알람 관리
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── NotificationManager.tsx  # 알림 관리
├── lib/
│   ├── youtube.ts        # 유튜브 API
│   ├── storage.ts        # localStorage 관리
│   ├── scheduler.ts      # 알림 스케줄링
│   └── deeplink.ts       # 딥링크 처리
└── types/
    └── index.ts          # 타입 정의
```

## 🔧 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- date-fns
- localStorage (데이터 저장)

## 📝 참고사항

- 웹 환경에서는 OS 네이티브 알림 대신 브라우저 Notification API 사용
- 실제 모바일 앱 개발 시 React Native로 포팅 필요
- localStorage 사용으로 로그인 없이 로컬에서만 데이터 관리
