# GitDiffLocal（git-diff-html）

[English](#english) · [中文](#中文)

---

## English

Generate Gerrit/BeyondCompare-style side-by-side HTML diff reports for Git repositories.

Suitable for code review, version comparison, commit review, and archiving code changes. The generated report is a **single self-contained HTML file** that works offline and is easy to share.

### Features

- **Side-by-side view**: changes shown in a two-pane "old / new" layout at a glance
- **Dual diff highlighting**: whole-line coloring plus character-level inline highlighting, precise to the changed character
- **Multiple compare modes**: working tree vs HEAD, working tree vs a specific commit, between two commits, staged changes
- **File list navigation**: sidebar shows changed files and status (modified/added/deleted/renamed), with jump and scroll-to
- **View toggle**: one-click switch between "full view" and "diff only"
- **Pane interaction**: drag to resize columns, double-click to reset, horizontal scrollbars synchronized across panes
- **C/C++ syntax highlighting**: keywords, types, strings, comments, preprocessor directives, numbers
- **Summary stats**: the top of the report totals added/deleted lines per file and overall
- **Zero dependencies**: pure Python standard library, no third-party packages

### Installation

This is a single-file script; no installation is needed. It only requires:

- Python 3.7+
- Git 2.x
- A modern browser (to view the report)

```bash
# Optional: make it executable and add it to PATH as the `gdhtm` command
chmod +x git_diff_html.py
sudo ln -s "$(pwd)/git_diff_html.py" /usr/local/bin/gdhtm
```

> Note: the script must use **LF** line endings, otherwise running it directly will fail with `python3\r` not found.
> Check: `file git_diff_html.py` should not report `CRLF`; if it does, run `sed -i 's/\r$//' git_diff_html.py`.

### Usage

```text
gdhtm [ref] [file ...]     or     gdhtm -r REF1 REF2 [file ...]
```

#### Examples

```bash
gdhtm                  # working tree vs HEAD, and auto-open the report
gdhtm abc123           # working tree vs commit abc123
gdhtm abc123 file.c    # working tree vs abc123, only file.c
gdhtm -r aaa bbb       # commit aaa vs commit bbb
gdhtm -s               # staged changes (git diff --cached)
```

#### Positional argument rules (how a ref is recognized)

Scan left to right: the **first argument git can resolve to a commit** becomes the comparison base, and **everything else is treated as a file/path filter**.

| Input | `git rev-parse --verify` | Classified as |
| --- | --- | --- |
| `abc123` / `HEAD~3` / branch / tag | resolves | ref (base) |
| `service/Makefile` / `libs/` | fails | file / path filter |

- Comparing two commits can **only** be done with `-r`; positional arguments never guess two commits at once, so it is never ambiguous.
- In the rare case a filename's hex collides with a commit prefix, prefix `./` to force it as a file: `gdhtm ./deadbeef`.

#### Command-line options

| Option | Description |
| --- | --- |
| `-o, --output FILE` | Output HTML file path (default: a temp file under `~/git-diff-html/`) |
| `-c, --commit REF` | Base commit to compare against (default `HEAD`) |
| `-r, --range REF1 REF2` | Compare two commits directly |
| `-s, --staged` | Show staged changes (`git diff --cached`) |
| `--no-open` | Do not auto-open the browser after generation |
| `--no-syntax` | Disable C/C++ syntax highlighting |
| `-C, --context N` | Number of context lines around changes (default `3`) |
| `-h, --help` | Show help |

### Viewing the report

The report opens in the browser by default. On the report page you can:

- Drag the middle splitter to resize the columns, double-click to reset
- Drag the left splitter to resize the file list width
- Click "Full view / Diff only" to toggle the view
- Click a file in the left list to jump; scrolling auto-highlights the current file

### Anti-misuse tips

- **Two refs point to the same commit** → warning `are the same commit`.
- **File/path typo** → warning `not found in worktree, git index, or the compared refs` (checks the worktree, the index, and both compared refs to avoid false positives).
- **Both versions identical** → `No changed files found` plus a hint.

### How it works

1. Get the changed file list via `git diff`, and read each version's content via `git show`
2. Compute line-level and character-level diffs with `difflib.SequenceMatcher`
3. Render the result as a single-file HTML report with built-in CSS/JavaScript

### Project structure

```text
GitDiffLocal/
├── git_diff_html.py   # main program (single file)
├── README.md
└── 软著材料/          # software copyright registration materials
```

### License

Released under the [GNU General Public License v3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl-3.0.html).

Copyright © 2026 Shanghai Xiandao Zhijue Technology Co., Ltd. (上海先道智觉科技有限责任公司), Symthosm

---

## 中文

将 Git 版本库中的代码差异，生成 Gerrit/BeyondCompare 风格的左右双栏 HTML 可视化报告。

适用于代码审查（Code Review）、版本对比、提交评审与代码变更归档。生成的报告为**单文件 HTML**，离线可用、便于分发。

### 功能特性

- **左右双栏对比视图**：变更以「旧 / 新」双栏并排展示，一目了然
- **双重差异高亮**：整行着色 + 字符级内联高亮，精确到改动的字符
- **多种对比模式**：工作区 vs HEAD、工作区 vs 指定提交、两个提交之间、暂存区
- **文件列表导航**：侧边栏展示变更文件与状态（修改/新增/删除/重命名），支持跳转与滚动定位
- **视图切换**：「完整对比」与「只看变化」一键切换
- **分栏交互**：拖拽调整左右列宽、双击复位，横向滚动条跨栏同步
- **C/C++ 语法高亮**：关键字、类型、字符串、注释、预处理指令、数字着色
- **统计摘要**：报告顶部汇总各文件增删行数与变更总量
- **零依赖**：纯 Python 标准库实现，无第三方包

### 安装

本项目为单文件脚本，无需安装，仅要求系统已安装：

- Python 3.7+
- Git 2.x
- 一个现代浏览器（用于查看报告）

```bash
# 可选：赋予可执行权限，并加入 PATH 作为 gdhtm 命令使用
chmod +x git_diff_html.py
sudo ln -s "$(pwd)/git_diff_html.py" /usr/local/bin/gdhtm
```

> 注意：脚本必须是 **LF 换行**，否则直接执行会报 `python3\r` 找不到。
> 检查：`file git_diff_html.py` 不应出现 `CRLF`；如有则 `sed -i 's/\r$//' git_diff_html.py`。

### 使用方法

```text
gdhtm [ref] [file ...]     或     gdhtm -r REF1 REF2 [file ...]
```

#### 示例

```bash
gdhtm                  # 工作区 vs HEAD，并自动打开报告
gdhtm abc123           # 工作区 vs 提交 abc123
gdhtm abc123 file.c    # 工作区 vs abc123，仅对比 file.c
gdhtm -r aaa bbb       # 提交 aaa vs 提交 bbb
gdhtm -s               # 暂存区变更（git diff --cached）
```

#### 位置参数规则（ref 怎么认）

从左到右扫描，**第一个能被 git 解析成 commit 的参数**当作对比基准，**其余全部当文件/路径过滤**。

| 输入 | `git rev-parse --verify` | 归类 |
| --- | --- | --- |
| `abc123` / `HEAD~3` / 分支名 / tag | 能解析 | ref（基准） |
| `service/Makefile` / `libs/` | 解析失败 | 文件 / 路径过滤 |

- 两 commit 对比**只能**用 `-r`，位置参数不会同时猜两个 commit，永不歧义。
- 极少数文件名的 hex 恰好撞上 commit 前缀时，加 `./` 前缀强制当文件：`gdhtm ./deadbeef`。

#### 命令行选项

| 选项 | 说明 |
| --- | --- |
| `-o, --output FILE` | 输出 HTML 文件路径（默认写入 `~/git-diff-html/` 下的临时文件） |
| `-c, --commit REF` | 对比的基准提交（默认 `HEAD`） |
| `-r, --range REF1 REF2` | 直接对比两个提交 |
| `-s, --staged` | 显示暂存区变更（`git diff --cached`） |
| `--no-open` | 生成后不自动打开浏览器 |
| `--no-syntax` | 关闭 C/C++ 语法高亮 |
| `-C, --context N` | 差异上下文行数（默认 `3`） |
| `-h, --help` | 显示帮助 |

### 查看报告

生成后默认自动在浏览器中打开。在报告页可以：

- 拖拽中间分隔条调整左右列宽，双击分隔条复位
- 拖拽左侧分隔条调整文件列表宽度
- 点击「完整对比 / 只看变化」切换视图
- 点击左侧文件列表快速跳转，滚动时自动高亮当前文件

### 防误用提示

- **两个 ref 指向同一 commit** → 警告 `are the same commit`。
- **文件/路径拼写错误** → 警告 `not found in worktree, git index, or the compared refs`（会同时检查工作区、索引、两个对比 ref，避免误报）。
- **两个版本完全相同** → `No changed files found` + 提示。

### 工作原理

1. 通过 `git diff` 获取变更文件列表，通过 `git show` 读取各版本文件内容
2. 使用 `difflib.SequenceMatcher` 计算行级与字符级差异
3. 将比对结果渲染为内置 CSS/JavaScript 的单文件 HTML 报告

### 项目结构

```text
GitDiffLocal/
├── git_diff_html.py   # 主程序（单文件）
├── README.md
└── 软著材料/          # 软件著作权登记相关材料
```

### 许可证

本项目按 [GNU 通用公共许可证 v3.0（GPL-3.0）](https://www.gnu.org/licenses/gpl-3.0.html) 发布。

版权所有 © 2026 上海先道智觉科技有限责任公司（Shanghai Xiandao Zhijue Technology Co., Ltd.）, Symthosm
