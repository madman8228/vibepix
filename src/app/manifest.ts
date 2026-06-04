import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "头像日签",
    short_name: "头像日签",
    description: "上传一张头像，先看一段轻解读，再从推荐玩法里挑一个继续玩。",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#fcfaf6",
    theme_color: "#fcfaf6",
    lang: "zh-CN",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
