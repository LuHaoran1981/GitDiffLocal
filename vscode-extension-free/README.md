# Git Diff HTML Report (Free)

Generate a Gerrit/BeyondCompare-style side-by-side HTML diff report comparing
your working tree against `HEAD`, plus a C/C++ color theme.

This is the free edition: it covers the basic working-tree-vs-`HEAD`
comparison. It is fully localized — when VS Code runs in a Chinese (`zh-*`)
locale, all prompts and messages appear in Chinese; otherwise they appear in
English.

## Features

- **One-click report**: a status-bar button, plus triggers from the Command
  Palette, the Explorer context menu, the editor context menu, or the Source
  Control (SCM) view
- **Compare working tree vs HEAD**: generates the side-by-side diff report for
  your current changes against `HEAD`
- **Target a path**: right-click a file or folder to diff only that path
- **C/C++ color theme**: ships the `Symthosm C/C++` light theme with six-color
  highlighting for keywords, types, strings, comments, preprocessor directives,
  and numbers

## Requirements

- `git` available on your `PATH`
- `python3` (Linux/macOS) or `python` (Windows)

## Usage

1. Open a Git repository as a workspace folder
2. Generate the report from any of:
   - **Status bar**: click the `Diff Report` button (bottom-left)
   - Command Palette (`Ctrl+Shift+P`) → `GitDiff: Generate Git Diff HTML Report`
   - Right-click in the Explorer, editor, or Source Control view →
     `Generate Git Diff HTML Report`
3. The report opens in an editor tab, showing your working-tree changes against
   `HEAD`

## Theme

After installing, go to `Preferences → Color Theme` and choose
`Symthosm C/C++`.

## License

GPL-3.0-or-later. Copyright © 上海先道智觉科技有限责任公司 (Symthosm(Xian Dao Zhi Jue)).
