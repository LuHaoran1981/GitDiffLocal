# Git Diff HTML Report

Generate Gerrit/BeyondCompare-style side-by-side HTML diff reports for Git
repositories, plus a C/C++ color theme.

The extension is fully localized: when VS Code runs in a Chinese (`zh-*`)
locale, all buttons, prompts, and messages appear in Chinese; otherwise they
appear in English.

## Features

- **One-click report**: a status-bar button, plus triggers from the Command
  Palette, the Explorer context menu, the editor context menu, or the Source
  Control (SCM) view
- **Commit browser**: the status-bar button opens a picker that lists `HEAD`,
  the staged area, and your recent commits
- **Single-baseline compare**: click one entry to diff it against the working
  tree
- **Two-baseline compare**: switch to checkbox mode, tick exactly two
  entries, then click Compare
- **Pagination**: step through older commits ten at a time (the button grays
  out when there are no more)
- **Save / Save as**: write the last generated report to the default folder or
  to a location you choose
- **Target a path**: right-click a file or folder to diff only that path
- **C/C++ color theme**: ships the `Symthosm C/C++` light theme with six-color
  highlighting for keywords, types, strings, comments, preprocessor directives,
  and numbers

## Requirements

- `git` available on your `PATH`
- `python3` (Linux/macOS) or `python` (Windows)

## Usage

1. Open a Git repository as a workspace folder
2. Trigger the picker from any of:
   - **Status bar**: click the `Diff Report` button (bottom-left)
   - Command Palette (`Ctrl+Shift+P`) → `GitDiff: Generate Git Diff HTML Report`
   - Right-click in the Explorer, editor, or Source Control view →
     `Generate Git Diff HTML Report`
3. The picker lists `HEAD`, the staged area, and your 10 most recent commits

### The picker buttons

| Button | Icon | Action |
| --- | --- | --- |
| Next page of logs | chevron-down / circle-slash | Load the next 10 commits; grays out when there are none |
| Two baselines | checklist | Toggle checkbox mode on/off |
| Compare | play | Run the selected comparison |
| Save to default folder | save | Copy the last report to `<workspace>/git-diff-reports/` |
| Save as… | save-as | Save the last report to a chosen path |

### Comparison modes

- **Single mode (default)** — click an entry (`HEAD`, staged, or a commit) to
  diff it against the working tree. This runs immediately.
- **Two-baseline mode** — click the **Two baselines** button so checkboxes
  appear, tick exactly two entries, then click **Compare**.

By default the report compares the working tree against `HEAD`.

## Theme

After installing, go to `Preferences → Color Theme` and choose
`Symthosm C/C++`.

## License

GPL-3.0-or-later. Copyright © 上海先道智觉科技有限责任公司 (Symthosm(Xian Dao Zhi Jue)).
