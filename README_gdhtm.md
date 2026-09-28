# gdhtm — 终端友好的 Git Diff 查看器

把 `git diff` 渲染成浏览器里左右对照的 HTML 报告：语法高亮、行内增删标注、可拖分割条、Gerrit 式吸底滚动条。

- 源文件：`git_diff_html.py`（纯 Python 标准库，无第三方依赖）
- 命令：`gdhtm`（软链）

## 前置要求

- `python3`（系统自带即可）
- `git`（在 git 仓库内运行）
- 一个浏览器（默认生成后自动打开）

## 安装

```bash
sudo ln -sf /path/to/git_diff_html.py /usr/local/bin/gdhtm
```

> 注意：脚本必须是 **LF 换行**，否则直接执行会报 `python3\r` 找不到。
> 检查：`file git_diff_html.py` 不应出现 `CRLF`；如有，`sed -i 's/\r$//' git_diff_html.py`。

## 用法速查

```bash
gdhtm                        # 工作区 vs HEAD，自动打开浏览器
gdhtm abc123                 # 工作区 vs commit abc123
gdhtm abc123 path/to/file    # 工作区 vs abc123，只看该文件
gdhtm -r aaa bbb             # commit aaa vs commit bbb（两 commit 对比）
gdhtm -r aaa bbb path/       # 两 commit 对比，只看 path/ 下的改动
gdhtm -s                     # 暂存区（git diff --cached）
gdhtm --no-open              # 只生成不弹浏览器（适合脚本/CI）
```

## 位置参数规则（ref 怎么认）

从左到右扫，**第一个能被 git 解析成 commit 的参数**当作对比基准，**其余全部当文件/路径过滤**。

| 输入 | `git rev-parse --verify` | 归类 |
|---|---|---|
| `abc123` / `HEAD~3` / 分支名 / tag | 能解析 | ref（基准） |
| `service/Makefile` / `libs/` | 解析失败 | 文件 / 路径过滤 |

- 两 commit 对比**只能**用 `-r`，位置参数不会同时猜两个 commit → 永不歧义。
- 极少数文件名的 hex 恰好撞上 commit 前缀时，加 `./` 前缀强制当文件：`gdhtm ./deadbeef`。

## 全部选项

| 选项 | 含义 |
|---|---|
| `-o, --output FILE` | 输出 HTML 路径（默认 `diff_report.html`） |
| `-c, --commit REF` | 显式指定对比基准（和位置参数二选一，位置参数优先） |
| `-r, --range REF1 REF2` | **对比两个 commit**：`git diff REF1 REF2` |
| `-s, --staged` | 对比暂存区（`git diff --cached`） |
| `--no-open` | 不自动打开浏览器（默认是打开的） |
| `--no-syntax` | 关闭 C/C++ 语法高亮 |
| `-C, --context N` | 上下文行数（默认 3） |
| `-h, --help` | 显示帮助 |

## 防误用提示

- **两个 ref 指向同一 commit** → 警告 `are the same commit`。
- **文件/路径拼写错误** → 警告 `not found in worktree, git index, or the compared refs`（会同时检查工作区、索引、两个对比 ref，避免误报）。
- **两个版本完全相同** → `No changed files found` + 提示。

## 报告功能

- 左右双栏（HEAD/REF vs WORKING/REF），中间分割条可拖、双击重置
- 行内增删高亮（Gerrit 风格，红色删除 / 绿色新增）
- C/C++ 语法高亮：关键字 / 类型 / 字符串 / 注释 / 预处理 / 数字
- 长行：每个 diff 框一条**吸屏底**横向滚动条（框在屏幕里时贴在屏幕底部）
- 侧边栏文件列表 + 滚动定位、Summary 统计、Top 按钮
