# GitDiffLocal（git-diff-html）

将 Git 版本库中的代码差异，生成 Gerrit/BeyondCompare 风格的左右双栏 HTML 可视化报告。

适用于代码审查（Code Review）、版本对比、提交评审与代码变更归档。生成的报告为**单文件 HTML**，离线可用、便于分发。

## 功能特性

- **左右双栏对比视图**：变更以「旧 / 新」双栏并排展示，一目了然
- **双重差异高亮**：整行着色 + 字符级内联高亮，精确到改动的字符
- **多种对比模式**：工作区 vs HEAD、工作区 vs 指定提交、两个提交之间、暂存区
- **文件列表导航**：侧边栏展示变更文件与状态（修改/新增/删除/重命名），支持跳转与滚动定位
- **视图切换**：「完整对比」与「只看变化」一键切换
- **分栏交互**：拖拽调整左右列宽、双击复位，横向滚动条跨栏同步
- **C/C++ 语法高亮**：关键字、类型、字符串、注释、预处理指令、数字着色
- **统计摘要**：报告顶部汇总各文件增删行数与变更总量
- **零依赖**：纯 Python 标准库实现，无第三方包

## 安装

本项目为单文件脚本，无需安装，仅要求系统已安装：

- Python 3.6+
- Git 2.x
- 一个现代浏览器（用于查看报告）

```bash
# 可选：赋予可执行权限，并加入 PATH 作为 gdhtm 命令使用
chmod +x git_diff_html.py
sudo ln -s "$(pwd)/git_diff_html.py" /usr/local/bin/gdhtm
```

> 注意：脚本必须是 **LF 换行**，否则直接执行会报 `python3\r` 找不到。
> 检查：`file git_diff_html.py` 不应出现 `CRLF`；如有则 `sed -i 's/\r$//' git_diff_html.py`。

## 使用方法

```text
gdhtm [ref] [file ...]     或     gdhtm -r REF1 REF2 [file ...]
```

### 示例

```bash
gdhtm                  # 工作区 vs HEAD，并自动打开报告
gdhtm abc123           # 工作区 vs 提交 abc123
gdhtm abc123 file.c    # 工作区 vs abc123，仅对比 file.c
gdhtm -r aaa bbb       # 提交 aaa vs 提交 bbb
gdhtm -s               # 暂存区变更（git diff --cached）
```

### 位置参数规则（ref 怎么认）

从左到右扫描，**第一个能被 git 解析成 commit 的参数**当作对比基准，**其余全部当文件/路径过滤**。

| 输入 | `git rev-parse --verify` | 归类 |
| --- | --- | --- |
| `abc123` / `HEAD~3` / 分支名 / tag | 能解析 | ref（基准） |
| `service/Makefile` / `libs/` | 解析失败 | 文件 / 路径过滤 |

- 两 commit 对比**只能**用 `-r`，位置参数不会同时猜两个 commit，永不歧义。
- 极少数文件名的 hex 恰好撞上 commit 前缀时，加 `./` 前缀强制当文件：`gdhtm ./deadbeef`。

### 命令行选项

| 选项 | 说明 |
| --- | --- |
| `-o, --output FILE` | 输出 HTML 文件路径（默认 `diff_report.html`） |
| `-c, --commit REF` | 对比的基准提交（默认 `HEAD`） |
| `-r, --range REF1 REF2` | 直接对比两个提交 |
| `-s, --staged` | 显示暂存区变更（`git diff --cached`） |
| `--no-open` | 生成后不自动打开浏览器 |
| `--no-syntax` | 关闭 C/C++ 语法高亮 |
| `-C, --context N` | 差异上下文行数（默认 `3`） |
| `-h, --help` | 显示帮助 |

## 查看报告

生成后默认自动在浏览器中打开。在报告页可以：

- 拖拽中间分隔条调整左右列宽，双击分隔条复位
- 拖拽左侧分隔条调整文件列表宽度
- 点击「完整对比 / 只看变化」切换视图
- 点击左侧文件列表快速跳转，滚动时自动高亮当前文件

## 防误用提示

- **两个 ref 指向同一 commit** → 警告 `are the same commit`。
- **文件/路径拼写错误** → 警告 `not found in worktree, git index, or the compared refs`（会同时检查工作区、索引、两个对比 ref，避免误报）。
- **两个版本完全相同** → `No changed files found` + 提示。

## 工作原理

1. 通过 `git diff` 获取变更文件列表，通过 `git show` 读取各版本文件内容
2. 使用 `difflib.SequenceMatcher` 计算行级与字符级差异
3. 将比对结果渲染为内置 CSS/JavaScript 的单文件 HTML 报告

## 项目结构

```text
GitDiffLocal/
├── git_diff_html.py   # 主程序（单文件）
├── README.md
└── 软著材料/          # 软件著作权登记相关材料
```

## 许可证

本项目按 [GNU 通用公共许可证 v3.0（GPL-3.0）](https://www.gnu.org/licenses/gpl-3.0.html) 发布。

版权所有 © 2026 上海先道智觉科技有限责任公司（Symthosm(Xian Dao Zhi Jue)）
