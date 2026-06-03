# Vibepix 快速说明 / 启动文档

## 1. 项目简介

Vibepix 是一个头像驱动的故事生成 MVP。
用户上传头像后，系统会：
1. 分析头像气质
2. 给出三组选项：风格 / 叙事模式 / gameplay
3. 允许用户调整选择
4. 创建 mocked 生成任务
5. 在结果页展示生成进度和结果图

当前版本重点是验证产品闭环，不是生产环境版本。

---

## 2. 环境要求

建议环境：
- Node.js 22+
- npm 10+
- Windows / macOS / Linux 均可

项目当前本地数据库为：
- SQLite（文件：`prisma/dev.db`）

---

## 3. 安装依赖

```bash
npm ci
```

---

## 4. 初始化数据库

```bash
npm run db:push
npm run db:seed
```

说明：
- `db:push` 会同步 Prisma schema 并生成 Prisma Client
- `db:seed` 会写入默认 tier 与推荐 catalog 数据
- 当前脚本已处理首次空库初始化场景，会自动确保本地 SQLite 文件存在

---

## 5. 启动开发环境

```bash
npm run dev
```

默认访问地址：
- [http://localhost:3000](http://localhost:3000)

---

## 6. 用户使用流程

### 首页 `/`
- 查看产品说明
- 选择一张头像
- 上传后自动跳转到推荐页

### 推荐页 `/recommend`
URL 参数：
- `uploadSessionId`
- `tierKey`

页面能力：
- 展示头像分析摘要与 vibe tags
- 展示三类推荐：
  - Recommended styles
  - Recommended modes
  - Recommended gameplay
- 点击卡片后即时保存当前选择
- 点击 `Generate result` 发起生成

### 结果页 `/generate/[jobId]`
页面能力：
- 轮询任务状态
- 展示进度条与阶段文案
- 在任务完成后显示 mock 结果图

---

## 7. API 说明

### `POST /api/upload`
请求体：

```json
{
  "fileName": "avatar.jpg",
  "mimeType": "image/jpeg",
  "sourceUrl": "data:image/jpeg;base64,..."
}
```

返回：

```json
{
  "uploadSessionId": "xxx",
  "analysis": {
    "summary": "Warm portrait with a calm, approachable feeling.",
    "vibeTags": ["gentle", "portrait", "friendly"]
  }
}
```

### `POST /api/recommend`
请求体：

```json
{
  "uploadSessionId": "xxx",
  "tierKey": "free"
}
```

作用：
- 返回分析结果
- 返回推荐集
- 返回当前已保存选择

### `PATCH /api/recommend`
请求体：

```json
{
  "recommendationId": "xxx",
  "selectedStyleKey": "campus-anime",
  "selectedModeKey": "day-in-the-life",
  "selectedGameplayKey": "study-buddy-quest"
}
```

作用：
- 持久化当前选择

### `POST /api/generate`
请求体：

```json
{
  "recommendationId": "xxx",
  "selectedStyleKey": "campus-anime",
  "selectedModeKey": "day-in-the-life",
  "selectedGameplayKey": "study-buddy-quest"
}
```

返回：

```json
{
  "jobId": "xxx",
  "status": "RUNNING",
  "redirectTo": "/generate/xxx"
}
```

### `GET /api/jobs/[jobId]`
作用：
- 查询任务状态
- 获取生成结果

---

## 8. 常用命令

### 本地开发

```bash
npm run dev
```

### 构建生产包

```bash
npm run build
npm run start
```

### 运行单元/集成测试

```bash
npm test
```

### 运行 E2E

```bash
npm run test:e2e
```

如果本机还没装 Playwright 浏览器：

```bash
npx playwright install chromium
```

---

## 9. 测试现状

当前已验证：
- Vitest：6 个测试文件，21 个测试用例通过
- Playwright：1 条从首页上传到结果页的端到端冒烟链路通过
- Next.js 生产构建通过

---

## 10. 当前实现边界

以下能力当前仍未落地为正式生产能力：
- 真实 AI 图像理解
- 真实 AI 出图
- 用户登录
- 配额扣减
- 支付 / 订阅
- 对象存储 / CDN
- 运营后台
- 任务队列 / Worker
- 监控告警

---

## 11. 常见排查建议

### 上传后没有进入推荐页
优先检查：
- 浏览器控制台是否有请求报错
- `/api/upload` 是否返回 400/500
- 上传的 `sourceUrl` 是否成功生成

### 推荐页打不开
优先检查：
- URL 中是否带有 `uploadSessionId`
- 是否已执行 `npm run db:seed`
- 数据库里是否存在 `free` / `plus` tier

### 生成页一直不完成
优先检查：
- `/api/generate` 是否返回 `jobId`
- `/api/jobs/[jobId]` 是否能正常返回
- `Job` / `Work` 表中是否写入了结果数据

### E2E 无法启动浏览器
执行：

```bash
npx playwright install chromium
```
