import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Routine_ON : 운동영상알림",
  description: "유튜브 운동 영상 알람 프로토타입",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
