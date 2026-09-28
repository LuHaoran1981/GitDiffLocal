# Git Diff HTML Report

Generate Gerrit/BeyondCompare-style side-by-side HTML diff reports for Git
repositories, plus a C/C++ color theme.

## Features

- **One-click report**: trigger from the Command Palette, the Explorer
  context menu, the editor context menu, or the Source Control (SCM) view
- **Built-in webview**: the report opens directly in a VS Code panel, with
  draggable panes, view toggling, and synchronized scrolling
- **Target a path**: right-click a file or folder to diff only that path
- **C/C++ color theme**: ships the `Symthosm C/C++` light theme with six-color
  highlighting for keywords, types, strings, comments, preprocessor directives,
  and numbers

## Requirements

- `git` available on your `PATH`
- `python3` (Linux/macOS) or `python` (Windows)

## Usage

1. Open a Git repository as a workspace folder
2. Trigger from any of:
   - Command Palette (`Ctrl+Shift+P`) → `GitDiff: Generate Git Diff HTML Report`
   - Right-click in the Explorer, editor, or Source Control view →
     `Generate Git Diff HTML Report`
3. The report opens in a webview panel

By default the report compares the working tree against `HEAD`. To compare two
commits or staged changes, use the underlying `git-diff-html` CLI
(<https://github.com/LuHaoran1981/GitDiffLocal>).

## Theme

After installing, go to `Preferences → Color Theme` and choose
`Symthosm C/C++`.

## License

GPL-3.0-or-later. Copyright © 上海先道智觉科技有限责任公司 (Symthosm(Xian Dao Zhi Jue)).
