# Git Diff HTML Report（免费版·中文说明）

为 Git 仓库生成 Gerrit/BeyondCompare 风格的并排 HTML diff 报告，对比工作区当前
改动与 `HEAD`，附带一个 C/C++ 配色主题。

这是免费版：只包含「工作区 vs HEAD」的基础对比。扩展已完全本地化——当 VS Code
运行在中文（`zh-*`）语言环境下，所有提示和消息均显示中文，否则显示英文。

## 功能特性

- **一键生成报告**：状态栏按钮，以及命令面板、资源管理器右键、编辑器右键、
  源代码管理（SCM）视图等多种触发方式
- **对比工作区 vs HEAD**：为当前改动生成并排 diff 报告
- **指定路径**：右键某个文件或文件夹，只 diff 该路径
- **C/C++ 配色主题**：附带 `Symthosm C/C++` 浅色主题，对关键字、类型、字符串、
  注释、预处理指令、数字进行六色高亮

## 环境要求

- `PATH` 中有 `git`
- `python3`（Linux/macOS）或 `python`（Windows）

## 使用方法

1. 以工作区形式打开一个 Git 仓库
2. 通过以下任一方式生成报告：
   - **状态栏**：点击左下角的 `Diff Report` 按钮
   - 命令面板（`Ctrl+Shift+P`）→ `GitDiff: Generate Git Diff HTML Report`
   - 在资源管理器、编辑器或源代码管理视图中右键 →
     `Generate Git Diff HTML Report`
3. 报告在编辑器标签页中打开，展示工作区当前改动 vs `HEAD`

## 主题

安装后，进入 `首选项 → 颜色主题`，选择 `Symthosm C/C++`。

## 许可证

GPL-3.0-or-later。版权所有 © 上海先道智觉科技有限责任公司 (Symthosm(Xian Dao Zhi Jue))。
