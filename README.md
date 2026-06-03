# Vibepix / NextPic

一个基于 Next.js + Prisma 的 **Story Avatar Generator MVP**。

当前项目已经不是“空脚手架”，而是一个可跑通的 MVP 原型：
- 首页上传头像
- 基于头像分析结果给出风格 / 叙事模式 / gameplay 推荐
- 支持保存推荐选择
- 发起 mocked 生成任务
- 在结果页轮询任务进度并展示生成结果

> 仓库目录名是 `vibepix`，`package.json` 名称仍为 `nextpic`。当前可把它理解为同一个项目的不同命名阶段。

## 文档导航

- [系统架构文档](./docs/ARCHITECTURE.md)
- [快速说明 / 启动文档](./docs/QUICK_START.md)
- [项目进度文档](./docs/PROJECT_PROGRESS.md)

## 当前能力

### 已实现
- Next.js App Router 前端页面：`/`、`/recommend`、`/generate/[jobId]`
- 上传 API：`POST /api/upload`
- 推荐 API：`POST /api/recommend`、`PATCH /api/recommend`
- 生成 API：`POST /api/generate`
- 任务查询 API：`GET /api/jobs/[jobId]`
- Prisma + SQLite 本地数据持久化
- 默认 tier / catalog seed 数据
- Vitest 单元/集成测试
- Playwright E2E 冒烟用例

### 当前仍是 MVP / Mock 的部分
- 图像理解与图像生成仍使用 mock provider，不是真实 AI 服务
- 结果图为 deterministic SVG mock 资产，不是真实出图
- 默认用户入口固定走 `free` tier
- `PromptTemplate`、`ModelRoute` 等表已建模，但还未接入实际配置后台与生产链路

## 本地启动

```bash
npm ci
npm run db:push
npm run db:seed
npm run dev
```

然后打开：
- [http://localhost:3000](http://localhost:3000)

## 验证命令

```bash
npm test
npm run build
npm run test:e2e
```

首次跑 E2E 如缺少浏览器，可先执行：

```bash
npx playwright install chromium
```

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma 7
- SQLite
- Vitest
- Playwright

## 项目主流程

1. 用户在首页上传头像
2. `/api/upload` 保存上传会话，并返回头像分析结果
3. `/recommend` 调用 `/api/recommend` 获取推荐集
4. 用户调整 style / mode / gameplay，选择会持久化
5. 点击生成后，`/api/generate` 创建任务与 mock 结果资产
6. `/generate/[jobId]` 轮询 `/api/jobs/[jobId]`
7. 任务到达 ready 时间后返回结果页展示
