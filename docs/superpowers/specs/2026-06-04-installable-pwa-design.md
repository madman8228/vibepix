# Avatar Daily Sign Installable PWA Design

## Goal
把当前头像日签 Web 应用做成“可安装到桌面”的 PWA 基础版，但不引入离线缓存、后台同步或推送通知。

## Scope
- 提供 Web App Manifest
- 提供安装所需图标
- 提供最小 service worker 注册能力，用于满足更稳定的安装识别
- 提供轻量安装入口
- 保持当前首页/玩法页/结果页主流程不变

## Non-Goals
- 不做离线可用
- 不做缓存策略
- 不做消息推送
- 不做后台同步

## Product Behavior
- 用户在支持的桌面浏览器中访问页面后，可看到“安装到桌面”入口
- 安装后应用以更接近独立窗口的方式启动
- 安装入口不应破坏当前白底日签感视觉风格
