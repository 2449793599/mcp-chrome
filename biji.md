# 快速开始

## 1. 克隆仓库

```
git clone https://github.com/YOUR_USERNAME/chrome-mcp-server.git

cd chrome-mcp-server
```

## 2. 安装依赖

```
pnpm install

执行报错：
$ pnpm install
Scope: all 5 workspace projects
../.. prepare$ husky
└─ Done in 103ms
. postinstall$ node dist/scripts/postinstall.js
│ node:internal/modules/cjs/loader:1459
│   throw err;
│   ^
│ Error: Cannot find module 'D:\workspace\mcp-chrome\app\native-server\dist\scripts\postinstall.js'
│     at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)
│     at defaultResolveImpl (node:internal/modules/cjs/loader:1066:19)
│     at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1071:22)
│     at Module._load (node:internal/modules/cjs/loader:1242:25)
│     at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
│     at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
│     at node:internal/main/run_main_module:33:47 {
│   code: 'MODULE_NOT_FOUND',
│   requireStack: []
│ }
│ Node.js v24.14.1
└─ Failed in 65ms at D:\workspace\mcp-chrome\app\native-server
../chrome-extension postinstall$ wxt prepare
└─ Running...
[ELIFECYCLE] Command failed with exit code 1.
```

**问题分析：**

1. **`native-server`** 的 `postinstall` 脚本是 `node dist/scripts/postinstall.js`，但 `dist` 目录在首次安装时还不存在（TypeScript 还没被编译）
2. **`chrome-extension`** 的 `postinstall` 脚本 `wxt prepare` 依赖于 `wxt` 包，但该包可能还未安装完成

**解决方案：** 修改 `postinstall` 脚本，使其能够处理 `dist` 目录不存在的情况。

```
/app/chrome-extension/package.json

-    "postinstall": "wxt prepare",
+    "prepare": "wxt prepare",
+    "postinstall": "node -e \"const fs=require('fs'); if(fs.existsSync('node_modules/wxt')){require('child_process').execSync('wxt pre
pare',{stdio:'inherit'})} else {console.log('Skipping wxt prepare: dependencies not fully installed yet. Run pnpm install again or use
pnpm prepare.');process.exit(0)}\"",

app/native-server/package.json

-    "postinstall": "node dist/scripts/postinstall.js"
+    "prepare": "ts-node src/scripts/postinstall.ts",
+    "postinstall": "node -e \"const fs=require('fs'); if(fs.existsSync('dist/scripts/postinstall.js')){require('./dist/scripts/postins
tall.js')} else {console.log('Skipping postinstall: dist not built yet. Run pnpm build first, or use pnpm prepare.');process.exit(0)}\"
"
```

再次运行时报如下错误：

```angular2html
Scope: all 5 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date
. prepare$ husky
└─ Done in 154ms
app/chrome-extension postinstall$ node -e "const fs=require('fs'); if(fs.existsSync('node_modules/wxt')){require('child_process').ex…
│ WXT 0.20.26
│  WARN  InlineConfig#runner is deprecated, use InlineConfig#webExt instead. See https://wxt.dev/guide/resources/upgrading.html#v0-1…
│ i Generating types...
│ √ Finished in 1.309 s
└─ Done in 3.1s
app/native-server postinstall$ node -e "const fs=require('fs'); if(fs.existsSync('dist/scripts/postinstall.js')){require('./dist/scr…
│ Skipping postinstall: dist not built yet. Run pnpm build first, or use pnpm prepare.
└─ Done in 63ms
app/native-server prepare$ ts-node src/scripts/postinstall.ts
[15 lines collapsed]
│ 2. If user-level installation fails, try system-level installation:
│    Use --system parameter (requires admin privileges):
│   npx mcp-chrome-bridge register --system
│
│    Or use administrator privileges directly:
│    Please run Command Prompt or PowerShell as administrator and execute:
│   npx mcp-chrome-bridge register
│ Ensure Chrome extension is installed and refresh the extension to connect to local service.
│ ⚠️ File not found: D:\workspace\mcp-chrome\app\native-server\src\run_host.bat
│ ⚠️ File not found: D:\workspace\mcp-chrome\app\native-server\src\cli.js
└─ Done in 1.5s
app/chrome-extension prepare$ wxt prepare
│ WXT 0.20.26
│  WARN  InlineConfig#runner is deprecated, use InlineConfig#webExt instead. See https://wxt.dev/guide/resources/upgrading.html#v0-1…
│ i Generating types...
│ √ Finished in 939 ms
└─ Done in 2.6s
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: better-sqlite3@11.6.0, esbuild@0.19.3, esbuild@0.27.7, protobufjs@6.11.6, sharp@0.32.0
, spawn-sync@1.0.15, vue-demi@0.14.10

Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
```

按照提示执行即可：pnpm approve-builds

## 3. 启动项目

```
npm run dev
```
