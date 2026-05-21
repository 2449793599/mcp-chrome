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

```
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



---
# native-server


## 0. 常用命令
```
C:\Users\WETEC>REG QUERY "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.chromemcp.nativehost"

HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.chromemcp.nativehost
    (默认)    REG_SZ    C:\Users\WETEC\AppData\Roaming\Google\Chrome\NativeMessagingHosts\com.chromemcp.nativehost.json
```
关键路径：
```
日志：
C:\Users\WETEC\AppData\Local\mcp-chrome-bridge\logs
清单
C:\Users\WETEC\AppData\Roaming\Google\Chrome\NativeMessagingHosts\com.chromemcp.nativehost.json


本地安装：
D:\workspace\chrome-mcp\app\native-server\dist\run_host.bat
全局安装：
C:\Users\WETEC\AppData\Local\pnpm\store\v11\links\@\mcp-chrome-bridge\1.0.31\54a067a99c8730c69f66eba430569844990c19a17208c0dfc7ffca6dcf6f9865\node_modules\mcp-chrome-bridge\dist\run_host.bat
C:\Users\WETEC\AppData\Roaming\npm\chrome-mcp-bridge.cmd

```


## 1. 本地编译安装

1. 执行输出：npm run dev

```
app/native-server dev: [nodemon] 3.1.14
app/native-server dev: [nodemon] to restart at any time, enter `rs`
app/native-server dev: [nodemon] watching path(s): src\**\*
app/native-server dev: [nodemon] watching extensions: ts,js,json
app/native-server dev: [nodemon] starting `npm run build && npm run register:dev`
app/native-server dev: > mcp-chrome-bridge@1.0.29 build
app/native-server dev: > ts-node src/scripts/build.ts
app/native-server dev: 清理上次构建...
app/native-server dev: dist 和 dist/logs 目录已创建/确认存在
app/native-server dev: 编译TypeScript...
app/native-server dev: 复制配置文件...
app/native-server dev: 已将 stdio-config.json 复制到 D:\workspace\chrome-mcp\app\native-server\dist\mcp\stdio-config.json
app/native-server dev: 准备package.json...
app/native-server dev: 复制包装脚本...
app/native-server dev: 已将 D:\workspace\chrome-mcp\app\native-server\src\scripts\run_host.sh 复制到 D:\workspace\chrome-mcp\app\native
-server\dist\run_host.sh
app/native-server dev: 已将 D:\workspace\chrome-mcp\app\native-server\src\scripts\run_host.bat 复制到 D:\workspace\chrome-mcp\app\nativ
e-server\dist\run_host.bat
app/native-server dev: 添加可执行权限...
app/native-server dev: 已为 index.js 添加可执行权限 (755)
app/native-server dev: 已为 cli.js 添加可执行权限 (755)
app/native-server dev: 已为 run_host.sh 添加可执行权限 (755)
app/native-server dev: 写入 node_path.txt...
app/native-server dev: 已写入 Node.js 路径: D:\software\nodejs\node.exe
app/native-server dev: ✅ 构建完成
app/native-server dev: > mcp-chrome-bridge@1.0.29 register:dev
app/native-server dev: > node dist/scripts/register-dev.js
app/native-server dev: Writing Node.js path: D:\software\nodejs\node.exe
app/native-server dev: ✓ Node.js path written for run_host scripts
app/native-server dev: Attempting to register user-level Native Messaging host...
app/native-server dev: ✓ Verified file accessibility for index.js
app/native-server dev: ✓ Verified file accessibility for run_host.bat
app/native-server dev: ✓ Verified file accessibility for cli.js
app/native-server dev: Detected browsers: chrome
app/native-server dev:
app/native-server dev: Registering for Chrome...
app/native-server dev: ✓ Manifest written to C:\Users\WETEC\AppData\Roaming\Google\Chrome\NativeMessagingHosts\com.chromemcp.nativehost
.json
app/native-server dev: ✓ Registry entry created for Chrome
app/native-server dev: ✓ Successfully registered Chrome
app/native-server dev:
app/native-server dev: ===== Registration Summary =====
app/native-server dev: ✓ Chrome: Success
app/native-server dev: [nodemon] clean exit - waiting for changes before restart
```

2. 编译：npm run build:shared

```
> mcp-chrome-bridge-monorepo@1.0.0 build:shared
> pnpm --filter chrome-mcp-shared build

$ tsup src/index.ts --format cjs,esm --dts --clean
CLI Building entry: src/index.ts
CLI Using tsconfig: tsconfig.json
CLI tsup v8.5.1
CLI Target: es2020
CLI Cleaning output folder
CJS Build start
ESM Build start
CJS dist\index.js 88.31 KB
CJS ⚡️ Build success in 39ms
ESM dist\index.mjs 86.56 KB
ESM ⚡️ Build success in 39ms
DTS Build start
DTS ⚡️ Build success in 971ms
DTS dist\index.d.ts  23.68 KB
DTS dist\index.d.mts 23.68 KB
```

3. 编译：npm run build:native

```
> mcp-chrome-bridge-monorepo@1.0.0 build:native
> pnpm --filter mcp-chrome-bridge build

$ ts-node src/scripts/build.ts
清理上次构建...
dist 和 dist/logs 目录已创建/确认存在
编译TypeScript...
复制配置文件...
已将 stdio-config.json 复制到 D:\workspace\chrome-mcp\app\native-server\dist\mcp\stdio-config.json
准备package.json...
复制包装脚本...
已将 D:\workspace\chrome-mcp\app\native-server\src\scripts\run_host.sh 复制到 D:\workspace\chrome-mcp\app\native-server\dist\run_host.s
h
已将 D:\workspace\chrome-mcp\app\native-server\src\scripts\run_host.bat 复制到 D:\workspace\chrome-mcp\app\native-server\dist\run_host.
bat
添加可执行权限...
已为 index.js 添加可执行权限 (755)
已为 cli.js 添加可执行权限 (755)
已为 run_host.sh 添加可执行权限 (755)
写入 node_path.txt...
已写入 Node.js 路径: D:\software\nodejs\node.exe
✅ 构建完成
```
清单文件写入路径：C:\Users\WETEC\AppData\Roaming\Google\Chrome\NativeMessagingHosts\com.chromemcp.nativehost.json
```
{
  "name": "com.chromemcp.nativehost",
  "description": "Node.js Host for Browser Bridge Extension",
  "path": "D:\\workspace\\chrome-mcp\\app\\native-server\\dist\\run_host.bat",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://hbdgbgagpkpjffpklnamcljpakneikee/"
  ]
}
```
run_host.bat：脚本运行日志目录
```
C:\Users\WETEC\AppData\Local\mcp-chrome-bridge\logs
```


## 2. 全局安装路径
- npm install -g mcp-chrome-bridge
- pnpm add -g mcp-chrome-bridge
- pnpm install -g mcp-chrome-bridge
```
$ npm config get prefix
C:\Users\WETEC\AppData\Roaming\npm

$ ll docs/biji/
total 18
-rwxr-xr-x 1 WETEC 197121 427 May 17 15:17 chrome-mcp-bridge*
-rw-r--r-- 1 WETEC 197121 344 May 17 15:17 chrome-mcp-bridge.cmd
-rwxr-xr-x 1 WETEC 197121 881 May 17 15:17 chrome-mcp-bridge.ps1*
-rwxr-xr-x 1 WETEC 197121 427 May 17 15:17 mcp-chrome-bridge*
-rw-r--r-- 1 WETEC 197121 344 May 17 15:17 mcp-chrome-bridge.cmd
-rwxr-xr-x 1 WETEC 197121 881 May 17 15:17 mcp-chrome-bridge.ps1*
-rwxr-xr-x 1 WETEC 197121 461 May 17 15:17 mcp-chrome-stdio*
-rw-r--r-- 1 WETEC 197121 361 May 17 15:17 mcp-chrome-stdio.cmd
-rwxr-xr-x 1 WETEC 197121 949 May 17 15:17 mcp-chrome-stdio.ps1*
```

mcp-chrome-bridge register
```
$ mcp-chrome-bridge register
Writing Node.js path: D:\software\nodejs\node.exe
✓ Node.js path written for run_host scripts
Warning: Unable to detect administrator privileges on Windows
Registering user-level Native Messaging host...
Attempting to register user-level Native Messaging host...
✓ Verified file accessibility for index.js
✓ Verified file accessibility for run_host.bat
✓ Verified file accessibility for cli.js
Detected browsers: chrome

Registering for Chrome...
✓ Manifest written to C:\Users\WETEC\AppData\Roaming\Google\Chrome\NativeMessagingHosts\com.chromemcp.nativehost.json
✓ Registry entry created for Chrome
✓ Successfully registered Chrome

===== Registration Summary =====
✓ Chrome: Success
Native Messaging host registered successfully!
You can now use connectNative in Chrome extension to connect to this service.
```
清单文件写入路径：C:\Users\WETEC\AppData\Roaming\Google\Chrome\NativeMessagingHosts\com.chromemcp.nativehost.json
```
{
  "name": "com.chromemcp.nativehost",
  "description": "Node.js Host for Browser Bridge Extension",
  "path": "C:\\Users\\WETEC\\AppData\\Local\\pnpm\\store\\v11\\links\\@\\mcp-chrome-bridge\\1.0.31\\54a067a99c8730c69f66eba430569844990c19a17208c0dfc7ffca6dcf6f9865\\node_modules\\mcp-chrome-bridge\\dist\\run_host.bat",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://hbdgbgagpkpjffpklnamcljpakneikee/"
  ]
}
```
run_host.bat：脚本运行日志目录
```
C:\Users\WETEC\AppData\Local\mcp-chrome-bridge\logs
```


## 3. 常见错误

脚本运行日志报错：
```
node:internal/modules/cjs/loader:692
      throw e;
      ^

Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './v4' is not defined by "exports" in C:\Users\WETEC\AppData\Local\pnpm\store\v11\links\@modelcontextprotocol\sdk\1.29.0\8c92280a9041a69976d4d272afcd263c001b923b2871609198e0db0171fff116\node_modules\zod\package.json
    at exportsNotFound (node:internal/modules/esm/resolve:314:10)
    at packageExportsResolve (node:internal/modules/esm/resolve:662:9)
    at resolveExports (node:internal/modules/cjs/loader:685:36)
    at Module._findPath (node:internal/modules/cjs/loader:752:31)
    at Module._resolveFilename (node:internal/modules/cjs/loader:1441:27)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1066:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1071:22)
    at Module._load (node:internal/modules/cjs/loader:1242:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1556:12) {
  code: 'ERR_PACKAGE_PATH_NOT_EXPORTED'
}
```
这个错误是因为你使用的`@modelcontextprotocol/sdk`需要从`Zod`导入v4子路径（zod/v4），但你当前项目中安装的是`Zod 3.x`版本，而`zod/v4`导出路径只在`Zod 4.x`中才存在

```
pnpm add zod@^4.0.0
```