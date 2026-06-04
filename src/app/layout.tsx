import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { ServiceWorkerRegistrar } from "../components/pwa/service-worker-registrar";

export const metadata: Metadata = {
  applicationName: "头像日签",
  title: "头像日签",
  description: "上传一张头像，先看一段轻解读，再从推荐玩法里挑一个继续玩。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "头像日签",
  },
};

export const viewport: Viewport = {
  themeColor: "#fcfaf6",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
