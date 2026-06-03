# Vibepix 项目进度文档

更新时间：2026-06-03

## 1. 进度结论

当前项目处于：**MVP 闭环已完成，真实 AI 生产化能力尚未接入**。

更准确地说：
- 产品主路径已经可以从上传跑到结果展示
- 数据库模型和接口协议已具备继续扩展的基础
- 但生成能力、套餐能力、后台能力、异步任务能力仍主要停留在 mock / 预留阶段

---

## 2. 已经完成

### 2.1 基础工程
- [x] Next.js 16 + React 19 + TypeScript 项目基础搭建
- [x] Tailwind CSS v4 接入
- [x] Prisma 7 + SQLite 接入
- [x] 本地 seed 数据脚本
- [x] Vitest / Playwright 测试基建

### 2.2 前端主流程
- [x] 首页 Hero 与上传入口
- [x] 上传后自动跳转推荐页
- [x] 推荐页展示三类推荐项
- [x] 推荐项切换与即时保存
- [x] 生成结果页轮询任务状态
- [x] 结果页展示 mock 生成图片与摘要

### 2.3 后端 API
- [x] `POST /api/upload`
- [x] `POST /api/recommend`
- [x] `PATCH /api/recommend`
- [x] `POST /api/generate`
- [x] `GET /api/jobs/[jobId]`

### 2.4 领域能力
- [x] 头像分析结果持久化
- [x] 基于 vibe tags 的推荐打分与排序
- [x] tier 过滤推荐候选项
- [x] recommendation 选择合法性校验
- [x] generation pipeline（character bible / prompt compiler / mock renderer）
- [x] panel 数量按 mode 决策

### 2.5 数据模型
- [x] `Tier`
- [x] `Upload`
- [x] `CatalogItem`
- [x] `Recommendation`
- [x] `Job`
- [x] `Work`
- [x] `PromptTemplate`（已建模）
- [x] `ModelRoute`（已建模）

### 2.6 测试与验证
- [x] 单元 / 集成测试通过（21/21）
- [x] E2E 冒烟链路通过（1 条）
- [x] 生产构建通过
- [x] 数据库初始化脚本已支持首次空库自举

---

## 3. 正在开发 / 半完成状态

> 这里的“正在开发”按代码现状理解为：已经有设计或骨架，但还没有形成真正完整能力。

### 3.1 真实 AI provider 接入
现状：
- 已有 provider 抽象层
- 当前实现仍是 `mock-image-understanding` 与 `mock-image-generation`

缺口：
- 还未接入真实多模态分析模型
- 还未接入真实图像生成模型
- 还未处理外部 provider 的失败重试、限流、超时

### 3.2 套餐体系
现状：
- `Tier`、tier filtering、plus-only catalog 都已经存在
- `mini-arc` / `plus` 的 panel 逻辑已建好

缺口：
- 首页入口默认固定 `tierKey=free`
- 没有套餐切换 UI
- 没有配额扣减、订阅状态、支付联动

### 3.3 Prompt / Model 路由能力
现状：
- `PromptTemplate`、`ModelRoute` 表已存在
- `Job` 上也预留了 `routeId`、`promptTemplateId`

缺口：
- 当前生成链路没有真正读取这些配置
- 没有后台管理能力
- 没有按模型策略动态分配生成任务

### 3.4 任务系统
现状：
- 已有 `Job`、`Work`、状态轮询、进度文案

缺口：
- 仍是本地 mocked job，不是真正异步队列
- 没有 worker / queue / webhook
- 没有失败重试、取消、恢复能力

### 3.5 文件与资源管理
现状：
- 上传通过 `data URL` 传入 API
- 结果图通过 SVG data URL 返回

缺口：
- 没有对象存储
- 没有 CDN
- 没有图片压缩、持久化、清理策略

---

## 4. 待开发

### 4.1 产品能力
- [ ] 真实头像分析能力
- [ ] 真实故事图 / 分镜图生成能力
- [ ] 作品历史记录页
- [ ] 再生成 / 换风格 / 多版本比较
- [ ] 用户账户体系
- [ ] 套餐订阅与支付

### 4.2 平台能力
- [ ] 对象存储接入（如 OSS / S3）
- [ ] 异步任务队列
- [ ] 后台管理系统（catalog / prompt / model route）
- [ ] 配额统计与扣减
- [ ] 埋点、监控、日志、告警
- [ ] CI/CD 流程

### 4.3 测试能力
- [ ] 更多失败路径 E2E
- [ ] 推荐页 / 生成页更多交互测试
- [ ] API 错误码和边界条件测试
- [ ] 持续集成自动跑测

### 4.4 架构演进
- [ ] 把 mock pipeline 演进为真实 provider orchestration
- [ ] 把本地轮询任务演进为可扩展异步任务架构
- [ ] 解耦“产品配置数据”和“生成执行链路”
- [ ] 支持真正的多模型路由策略

---

## 5. 当前风险与关注点

### 高优先级
1. **当前 AI 能力全部是 mock**
   - 产品演示可以成立
   - 但还不能代表真实出图质量和成本

2. **任务系统不是生产级异步架构**
   - 当前状态机更偏演示用途
   - 不适合直接承接真实慢任务

3. **上传与结果资产没有正式存储层**
   - 当前实现便于本地联调
   - 但不适合生产环境

### 中优先级
4. **tier 体系还没有真正对用户开放**
5. **Prompt / ModelRoute 建模完成但未接线**
6. **测试覆盖还偏主路径，异常场景不够多**

---

## 6. 下一阶段建议优先级

### P0
- 接入真实存储层
- 接入至少一个真实图像理解 provider
- 接入至少一个真实图像生成 provider
- 把当前生成任务改造成真实异步执行

### P1
- 完成套餐 / 配额体系
- 增加更多端到端测试
- 接入监控与日志

### P2
- 做后台配置化
- 支持多模型实验
- 支持历史作品与再生成

---

## 7. 本次文档更新时的实际验证结果

在本次整理文档时，已实际验证：
- `npm ci` 通过
- `npm run db:push` 通过
- `npm run db:seed` 通过
- `npm test` 通过
- `npm run build` 通过
- `npm run test:e2e` 通过

补充说明：
- 首次空库时，已补充 `prisma/db-push.ts` 的自举逻辑，避免 `dev.db` 不存在导致初始化失败
