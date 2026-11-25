# x2x 生产发版流程

本流程适用于 x2x 的 Web 页面、Next.js API、Supabase 文档服务和 WebRTC 传输。生产应用由 Vercel 跟踪 GitHub 的 `main` 自动发布。**应用提交需要推送到远端 `main` 才会触发发布。有数据库依赖时，先应用与线上旧代码兼容的迁移，再推送应用提交。**

## 1. 环境和发布边界

| 端 | 生产入口 | 变更如何生效 |
| --- | --- | --- |
| Web 前端 | [ymzzz.asia](https://ymzzz.asia) · [GitHub 仓库](https://github.com/ymzzz222/x2x) | `main` 更新后，由 Vercel 构建并切换生产部署。编辑器、首页、历史页和静态资源随该版本上线 |
| Next.js 服务端 | [Vercel x2x](https://vercel.com/ymzzz222s-projects/x2x) | `src/app/api` 下的文档、通知、工作区和信令接口与 Web 前端共用同一部署和提交 |
| 数据库、Auth 和 Realtime | [Supabase 生产项目](https://supabase.com/dashboard/project/ifxzhhyrlrbzsefnwxle) | PostgreSQL 迁移单独应用。Auth 和 Realtime 的托管配置按具体变更核对。Git 推送可以随版本保存 SQL 文件，数据库执行另走 Supabase |
| WebRTC 和信令 | [生产首页](https://ymzzz.asia) · [信令实现](../../src/lib/signaling-store.ts) | `/api/signaling` 随 Next.js 部署。浏览器负责点对点传输，房间由 Node 进程内存维护 |

本机开发使用项目自己的 Supabase 和 `.env.local`。预发验证使用隔离的数据库和账号。发布时从 Vercel 的对象和域名核对目标，从 `NEXT_PUBLIC_SUPABASE_URL` 核对实际生效的项目 ref。项目或生产分支调整后，以控制台与线上真实配置复核本页。

## 2. 发版前准备

1. 在 [Vercel 部署列表](https://vercel.com/ymzzz222s-projects/x2x/deployments) 记录当前生产提交、Deployment ID 和可回退版本。核对 GitHub `origin` 指向 `ymzzz222/x2x`，固定本次待发提交。检查暂存、未跟踪文件、前端与 API 差异、锁文件和 SQL 迁移，按路径暂存本次内容。测试凭据留在本地，发布记录只写环境变量名。
2. 按改动范围复验。在隔离数据库执行与候选版本一致的迁移，确认已有数据能读回，检查编辑、权限、保存、版本恢复和断线。涉及数据库与应用同时更新时，额外验证上一版应用能在迁移后的数据库继续运行。从运行时删除旧列或旧 RPC 的变更分阶段发布，先新增兼容路径，再切换应用，最后回收旧结构。
3. 用项目锁文件构建。当前 Next.js 的 Node.js 最低要求为 `20.9.0`。本机验收尽量匹配 Vercel 项目的 Node 主版本和构建命令。生产成功与否以 Vercel 实际构建及生产验证为准。

```bash
npm ci
npm exec -- tsc --noEmit
npm exec -- vitest run tests/editor/unit/document-model.test.ts
npm run build
```

共享 E2E 会创建账号、文档和权限关系。用独立 Supabase 项目和端口启动本机验收环境，先把该环境的 URL、公钥和服务端密钥填入验收副本的 `.env.local`。用同一配置构建并启动本机应用。

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3106
```

在另一终端从同一验收副本执行测试。

```bash
EDITOR_TEST_URL=http://127.0.0.1:3106 \
  node --env-file=.env.local ./node_modules/@playwright/test/cli.js \
  test tests/editor/e2e --workers=1 --repeat-each=2
```

共享测试需要已安装 Chrome。涉及公开访客时另开公开测试环境并提供 `EDITOR_PUBLIC_TEST_URL`。性能专项使用 `EDITOR_BENCH=1` 单跑相应用例。记录实际通过、失败和跳过数量。编辑器的详细合同见[验收总清单](../editor/ym-research-task.md)。

## 3. 生产配置

先核对 Vercel 项目的 **Settings → Environment Variables → Production**。只改配置的发版也需要创建新的生产部署。已构建的版本保留其构建时配置。 [Vercel 环境变量说明](https://vercel.com/docs/environment-variables)

| 变量 | 用途 | 核对 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 浏览器和服务器的 Supabase 地址 | 主机对应选定的生产项目 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 浏览器 Auth 和 Realtime | 使用同一生产项目的公钥 |
| `SUPABASE_SECRET_KEY` | Next.js 服务端鉴权、RPC 与实时会话签名 | 存在于 Vercel 服务端环境，前端构建仅使用公钥 |
| `X2X_PUBLIC_DOCUMENTS` | 文档访问模式 | 私有模式为 `false` 或未设置。公开共享剧本使用 `true`，并核对独立项目的匿名登录、专用文档身份和设置记录 |
| `NEXT_PUBLIC_X2X_STUN_URLS` | 可选的浏览器 STUN 地址列表 | 使用逗号分隔，未设置时使用代码内置配置。调整后重新构建并验证双设备传输 |

当前公开模式的配置步骤见[项目 README](../../README.md#公开剧本库)。如涉及 Auth 的站点地址、回调允许列表、匿名登录或密钥轮换，同时核对 Supabase 后台有效值与 Vercel 配置。记录变更键名及生效环境，凭据保存在相应平台的配置中。

## 4. 数据库端发布

### 常规迁移

1. 列出 `supabase/migrations` 中本次新增的文件，与生产迁移历史逐项比对。已有版本通过新增增量迁移调整。数据库变更涉及表重写、数据删除或权限切换时，在切换前明确影响、备份恢复点与应用兼容路径。
2. 使用 Supabase CLI v3，显式指定项目 ref。先读历史并预演，预演只应列出本次已审查的迁移。包含额外迁移、历史版本缺失或目标项目不符时，先核对差异。

```bash
X2X_DB_REF=ifxzhhyrlrbzsefnwxle
supabase migration list --remote="$X2X_DB_REF"
supabase db push --remote="$X2X_DB_REF" --skip-vault --dry-run
```

3. 用同一候选版本执行迁移。示例保留交互确认。这里使用 `--skip-vault` 只发布数据库迁移，若本次涉及 Vault，按该配置变更的发布方案执行。重读历史，并针对本次迁移核对真实对象与权限。

```bash
supabase db push --remote="$X2X_DB_REF" --skip-vault
supabase migration list --remote="$X2X_DB_REF"
supabase db query --read-only --remote="$X2X_DB_REF" \
  "select version, name from supabase_migrations.schema_migrations order by version desc limit 5"
```

[Supabase 迁移文档](https://supabase.com/docs/guides/deployment/database-migrations) · [本机与托管项目定位](https://supabase.com/docs/guides/local-development/local-and-hosted-projects)

### 连接池失败

先通过 HTTPS 管理查询检查生产记录和真实对象。若一次写操作响应丢失，先确认迁移历史和对象状态，再决定是否恢复或重试。

```bash
supabase db query --read-only --remote="$X2X_DB_REF" \
  "select version, name from supabase_migrations.schema_migrations order by version"
```

当正常推送不可达，且确认只有一份可在事务内执行的迁移时，可用已授权的 HTTPS 管理查询：

1. 从待发布提交提取原始 SQL。准备本次专用事务文件，设置短锁等待，锁定迁移历史并核对预期基线。
2. 在同一事务执行原始 SQL，向 `supabase_migrations.schema_migrations` 登记原文件对应的 `version`、`name` 和 `statements`。出错时让事务回滚。先在隔离环境验证与本次实际历史表结构兼容。
3. 在核对目标和事务文件后执行，再通过独立只读请求校验历史、原始内容和预期对象。下面的路径应替换为本次已复核的事务文件。

```bash
supabase db query --remote="$X2X_DB_REF" --file "/path/to/reviewed-release-transaction.sql"
```

`202611240001` 的生产发布使用过该路径。写入后核验了已登记内容的哈希、两个协同 RPC、两条 Realtime 策略和光标函数权限。遇到部分状态或不可在事务内执行的语句时，先按实际数据库状态制定增量恢复步骤。 [实时协同迁移](../../supabase/migrations/202611240001_document_realtime.sql) · [Supabase 只读查询](https://supabase.com/docs/reference/api/v1-read-only-query)

## 5. 前端与 Next.js API 发布

1. 有数据库迁移时，先确认生产迁移与对象检查已完成。有配置更新时，确认 Vercel Production 配置已就绪。
2. 在已核实的发布分支上固定提交。若远端 `main` 前移，先核对并发变更如何纳入候选版本，再复验。向 Vercel 实际绑定的 GitHub `main` 普通推送，并核对远端 SHA。

```bash
git remote get-url origin
git ls-remote --heads origin refs/heads/main
git diff --cached --check
git diff --cached --stat
# 根据本次变更填写提交说明
git commit -m "release: x2x production update"
release_sha=$(git rev-parse HEAD)
git push --no-mirror --no-follow-tags --recurse-submodules=no origin "${release_sha}:refs/heads/main"
git ls-remote --heads origin refs/heads/main
```

3. 在 Vercel 确认新部署来源为该 SHA，状态为 **Ready**，环境为 **Production**，并成为 **Current**。自定义域名 `ymzzz.asia` 和 `www.ymzzz.asia` 应指向预期生产部署。仅配置更新时，用同一代码版本重新部署并再次验证配置生效。 [Vercel Git 发布](https://vercel.com/docs/git) · [生产部署行为](https://vercel.com/docs/deployments/environments)
4. 构建失败时先读当前部署日志，处理后重新构建。历史页曾报告动态文件读取引发的追踪警告，检查 [Next.js 配置](../../next.config.ts) 中的研究资料排除规则，并实际打开历史页与本次受影响的正文入口。新错误按堆栈定位到对应路由。

## 6. 线上验证和收口

先确认域名上的版本，再做访客检查。文档 API 对访客请求应返回 401。使用合法会话的功能按下表另验。

```bash
site=https://ymzzz.asia
for route in / /editor /history; do
  curl -fsS -o /dev/null -w "%{http_code} ${route}\n" "${site}${route}"
done
curl -sS -i "${site}/api/documents"
curl -sS -i "${site}/api/documents/00000000-0000-4000-8000-000000000000"
curl -sS -i "${site}/api/signaling"
```

| 端 | 通过条件 |
| --- | --- |
| Web | 首页、`/editor`、`/history` 返回 200。用 Chrome 打开编辑器，核对登录入口、页面交互和本次关键功能。涉及历史内容时打开实际目录和一篇正文 |
| 文档 API | 未登录请求返回 401 `LOGIN_REQUIRED`。使用授权测试文档确认真实保存回执、刷新读回、版本和权限符合本次变更 |
| Supabase 和 Realtime | 迁移历史和对象与候选提交一致。用授权的独立会话核对协作者、光标、正文广播、权限降级和 HTTP 回退。生产缺少可写测试条件时，在隔离环境做写入验证，在发布记录明确线上验证范围 |
| 传输和信令 | 空参数 GET `/api/signaling` 返回 400。使用两台设备打开同一站点，新建分享码，验证加入、SSE 信令、短文本和小文件传输。进程切换后旧房间可能失效，用新房间做验证 |

检查 Vercel Runtime Logs 和 Supabase 日志。文档 API 返回的 `X-Request-Id` 可与服务端日志关联。遇到 `SUPABASE_NOT_CONFIGURED` 先查 Vercel 变量；遇到 `DATABASE_UNAVAILABLE` 先查对应 RPC、迁移标记和 Supabase 日志。若域名仍显示旧版本，先核对生产当前 Deployment 及别名分配。

发版记录至少写明北京时间、操作者、生产基线、发布 SHA、Vercel Deployment、自定义域名、迁移版本、配置变更键、线上验证结果和剩余风险。最近一次完整发布示例为 `7a306c6` 配合 `202611240001`，数据库先应用，应用随后由 `main` 触发。 [示例部署](https://vercel.com/ymzzz222s-projects/x2x/5PXJVAYKzYxHKJAQbEYcpnWU83Nm)

## 7. 回退和恢复发布

| 场景 | 处理 |
| --- | --- |
| 应用构建失败，旧版仍是 Current | 先确认域名仍指向健康版本。如果数据库已前置并兼容旧版，保留已应用迁移，修复应用后重新发布 |
| 应用已上线，出现严重回归 | 在 Vercel 选择上一健康的生产部署，先核对其与当前数据库和凭据兼容，再执行 Instant Rollback。确认域名和接口恢复，并通过修复提交或普通 `git revert` 保持仓库后续历史可追踪 |
| 数据库迁移失败或结果不明 | 保留已验证的应用部署，先查看生产迁移记录和真实对象。事务回滚后可更正候选再执行。部分生效时根据记录拟定增量修复，从实际状态继续 |
| 数据库迁移已生效但行为异常 | 优先用经过验证的向前迁移保留发布后的业务写入。确需恢复备份或回到历史时间点时，先确定数据影响和恢复范围，再按独立恢复方案处理 |
| 环境变量或密钥变更导致问题 | 核对正确的环境和凭据版本，使用正确配置重新部署。回退到旧部署前确认其构建时绑定的凭据仍有效 |

Vercel Instant Rollback 会暂停生产域名自动分配。修复完成后，从项目页面提升已验证的部署以恢复自动分配，并再次确认 Current、域名、接口和关键业务链路。 [Vercel 即时回退](https://vercel.com/docs/instant-rollback) · [Vercel 密钥轮换](https://vercel.com/docs/environment-variables/rotating-secrets)
