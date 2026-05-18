import {execSync} from 'child_process';

import fs from 'fs';
import path from 'path';

const distDir = path.join(__dirname, '..', '..', 'dist');

// 清理上次构建
console.log('清理上次构建...');

try {
    fs.rmSync(distDir, {recursive: true, force: true});
} catch (err) {// 忽略目录不存在的错误
    console.log(err);
}

// 创建DIST目录
fs.mkdirSync(distDir, {recursive: true});
fs.mkdirSync(path.join(distDir, 'logs'), {recursive: true}); // 创建LOGS目录

console.log('DIST和DIST/LOGS目录已创建/确认存在');

// 编译TYPESCRIPT
console.log('编译TYPESCRIPT...');

execSync('tsc', {stdio: 'inherit'});

// 复制配置文件
console.log('复制配置文件...');

const configSrcPath = path.join(__dirname, '..', 'mcp', 'stdio-config.json');
const configDstPath = path.join(distDir, 'mcp', 'stdio-config.json');

try {

    // 确保目标目录存在
    fs.mkdirSync(path.dirname(configDstPath), {recursive: true});

    if (fs.existsSync(configSrcPath)) {

        fs.copyFileSync(configSrcPath, configDstPath);

        console.log(`已将STDIO-CONFIG.JSON复制到 ${configDstPath}`);

    } else {

        console.error(`错误: 配置文件未找到: ${configSrcPath}`);

    }

} catch (error) {

    console.error('复制配置文件时出错:', error);

}

// 复制PACKAGE.JSON并更新其内容
console.log('准备PACKAGE.JSON...');

const packageJson = require('../../package.json');

// 创建安装说明
const readmeContent = `# ${packageJson.name}

本程序为CHROME扩展的NATIVE-MESSAGING主机端。

## 安装说明

1. 确保已安装NODE.JS
2. 全局安装本程序:
   \`\`\`
   npm install -g ${packageJson.name}
   \`\`\`
3. 注册NATIVE-MESSAGE主机:
   \`\`\`
   # 用户级别安装（推荐）
   ${packageJson.name} register

   # 如果用户级别安装失败，可以尝试系统级别安装
   ${packageJson.name} register --system
   # 或者使用管理员权限
   sudo ${packageJson.name} register
   \`\`\`

## 使用方法

此应用程序由CHROME扩展自动启动，无需手动运行。
`;

fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);

console.log('复制包装脚本...');

const scriptsSourceDir = path.join(__dirname, '.');

const macWrapperSourcePath = path.join(scriptsSourceDir, 'run_host.sh');
const winWrapperSourcePath = path.join(scriptsSourceDir, 'run_host.bat');

const macWrapperDestPath = path.join(distDir, 'run_host.sh');
const winWrapperDestPath = path.join(distDir, 'run_host.bat');

try {

    if (fs.existsSync(macWrapperSourcePath)) {

        fs.copyFileSync(macWrapperSourcePath, macWrapperDestPath);

        console.log(`已将 ${macWrapperSourcePath} 复制到 ${macWrapperDestPath}`);

    } else {

        console.error(`错误: MAC包装脚本源文件未找到: ${macWrapperSourcePath}`);

    }

    if (fs.existsSync(winWrapperSourcePath)) {

        fs.copyFileSync(winWrapperSourcePath, winWrapperDestPath);

        console.log(`已将 ${winWrapperSourcePath} 复制到 ${winWrapperDestPath}`);

    } else {

        console.error(`错误: WIN包装脚本源文件未找到: ${winWrapperSourcePath}`);

    }

} catch (error) {

    console.error('复制包装脚本时出错:', error);

}

// 为关键JAVASCRIPT文件和MAC包装脚本添加可执行权限
console.log('添加可执行权限...');

const filesToMakeExecutable = ['index.js', 'cli.js', 'run_host.sh']; // CLI.JS假设在DIST根目录

filesToMakeExecutable.forEach((file) => {

    const filePath = path.join(distDir, file); // 现在是目标路径

    try {

        if (fs.existsSync(filePath)) {

            fs.chmodSync(filePath, '755');

            console.log(`已为 ${file} 添加可执行权限 (755)`);

        } else {

            console.warn(`警告: ${filePath} 不存在，无法添加可执行权限`);

        }

    } catch (error) {

        console.error(`为 ${file} 添加可执行权限时出错:`, error);

    }

});

// Write node_path.txt immediately after build to ensure Chrome uses the correct Node.js version.
// This is critical for development mode where dist is deleted on each rebuild.
// The file points to the same Node.js that compiled the native modules (better-sqlite3 etc.)
console.log('写入 node_path.txt ...');

const nodePathFile = path.join(distDir, 'node_path.txt');

fs.writeFileSync(nodePathFile, process.execPath, 'utf8');

console.log(`已写入NODE.JS路径: ${process.execPath}`);

console.log('✅ 构建完成');
