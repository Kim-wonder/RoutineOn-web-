// F-05: 유튜브 딥링크 실행 (핵심 기능)
export function openYouTubeVideo(videoId: string): void {
  const deepLink = `youtube://watch?v=${videoId}`;
  const webLink = `https://www.youtube.com/watch?v=${videoId}`;
  
  // 1순위: 딥링크 시도
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = deepLink;
  document.body.appendChild(iframe);
  
  // 2순위: 1초 후 웹 링크로 fallback (딥링크 실패 감지 불가하므로 타임아웃 사용)
  setTimeout(() => {
    document.body.removeChild(iframe);
    window.open(webLink, '_blank');
  }, 1000);
}
