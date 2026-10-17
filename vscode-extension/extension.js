const vscode = require('vscode');
const { execFile } = require('child_process');
const http = require('http');
const path = require('path');
const os = require('os');
const fs = require('fs');

const LOG_PAGE_SIZE = 10;

let extensionPath = null;
let lastReportPath = null;
let lang = 'en';
let reportServer = null;

// Pick Chinese when VS Code runs in a zh-* locale, English otherwise.
function t(zh, en) {
  return lang.startsWith('zh') ? zh : en;
}

function activate(context) {
  extensionPath = context.extensionPath;
  lang = (vscode.env.language || 'en').toLowerCase();

  const disposable = vscode.commands.registerCommand(
    'gitdiffhtml.generateReport',
    async (arg) => {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage(
          t('GitDiff：请先打开文件夹或工作区', 'GitDiff: open a folder or workspace first.')
        );
        return;
      }
      const cwd = folders[0].uri.fsPath;

      // Right-click on a file/folder (context menu) → diff only that path.
      const fileFilter = getFileFilter(arg, cwd);
      if (fileFilter) {
        await generate(cwd, { files: [fileFilter] });
      } else {
        showCommitPicker(cwd);
      }
    }
  );

  context.subscriptions.push(disposable);

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'gitdiffhtml.generateReport';
  statusBarItem.text = '$(git-compare) Diff Report';
  statusBarItem.tooltip = t('生成 Git Diff HTML 报告', 'Generate Git Diff HTML Report');
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

function getFileFilter(arg, cwd) {
  const uri = normalizeUri(arg);
  if (!uri) {
    return null;
  }
  const rel = path.relative(cwd, uri.fsPath);
  if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
    return rel;
  }
  return null;
}

function normalizeUri(arg) {
  if (!arg) {
    return null;
  }
  if (arg instanceof vscode.Uri) {
    return arg;
  }
  // SCM resource state (source control view context menu).
  if (arg.resourceUri instanceof vscode.Uri) {
    return arg.resourceUri;
  }
  if (arg.uri instanceof vscode.Uri) {
    return arg.uri;
  }
  if (typeof arg.fsPath === 'string') {
    return vscode.Uri.file(arg.fsPath);
  }
  return null;
}

function pythonCommand() {
  return process.platform === 'win32' ? 'python' : 'python3';
}

function showReport(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  if (reportServer) {
    reportServer.close();
    reportServer = null;
  }
  reportServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  reportServer.listen(0, '127.0.0.1', async () => {
    try {
      const port = reportServer.address().port;
      const local = vscode.Uri.parse(`http://127.0.0.1:${port}/`);
      const external = await vscode.env.asExternalUri(local);
      vscode.env.openExternal(external);
    } catch (_) {
      vscode.env.openExternal(vscode.Uri.file(htmlPath));
    }
  });
}

function gitLog(cwd, skip) {
  return new Promise((resolve) => {
    execFile(
      'git',
      [
        'log',
        '--format=%H%x09%s',
        '-n',
        String(LOG_PAGE_SIZE + 1),
        '--skip',
        String(skip),
      ],
      { cwd },
      (err, stdout) => {
        if (err) {
          resolve([]);
          return;
        }
        const commits = stdout
          .trim()
          .split('\n')
          .filter(Boolean)
          .map((line) => {
            const [hash, ...rest] = line.split('\t');
            return { hash, subject: rest.join('\t') };
          });
        resolve(commits);
      }
    );
  });
}

function generate(cwd, opts, outputPath) {
  return new Promise((resolve) => {
    const scriptPath = path.join(extensionPath, 'git_diff_html.py');
    const outPath =
      outputPath || path.join(os.tmpdir(), `git-diff-report-${Date.now()}.html`);
    const args = [scriptPath, '--no-open', '-o', outPath];
    if (opts.refs) {
      args.push('-r', ...opts.refs);
    } else if (opts.staged) {
      args.push('-s');
    } else if (opts.target && opts.target !== 'HEAD') {
      args.push(opts.target);
    }
    if (opts.files && opts.files.length) {
      args.push(...opts.files);
    }

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: t('GitDiff：正在生成 HTML 报告...', 'GitDiff: generating HTML report...'),
        cancellable: false,
      },
      () =>
        new Promise((res) => {
          execFile(pythonCommand(), args, { cwd }, (err, stdout, stderr) => {
            if (err) {
              const msg = (stderr || stdout || err.message).trim();
              vscode.window.showErrorMessage(
                t('GitDiff：', 'GitDiff: ') + msg
              );
              res();
              return;
            }
            if (!fs.existsSync(outPath)) {
              const msg = (stderr || stdout || '').trim();
              if (msg) {
                vscode.window.showWarningMessage(
                  t('GitDiff：', 'GitDiff: ') + msg
                );
              } else {
                vscode.window.showErrorMessage(
                  t('GitDiff：未生成报告', 'GitDiff: report was not generated.')
                );
              }
              res();
              return;
            }
            lastReportPath = outPath;
            showReport(outPath);
            res();
          });
        })
    ).then(resolve);
  });
}

function showCommitPicker(cwd) {
  const state = { offset: 0, hasMore: false, multi: false };
  let active = null;

  function open() {
    if (active) {
      active.dispose();
    }
    const picker = vscode.window.createQuickPick();
    active = picker;
    let prevSel = [];

    const btnNext = {
      iconPath: new vscode.ThemeIcon('chevron-down'),
      tooltip: t('下一组日志', 'Next page of logs'),
    };
    const btnToggle = {
      iconPath: new vscode.ThemeIcon('checklist'),
      tooltip: state.multi
        ? t('退出双基线模式', 'Exit two-baseline mode')
        : t('双基线对比', 'Compare two baselines'),
    };
    const btnCompare = {
      iconPath: new vscode.ThemeIcon('play'),
      tooltip: t('开始比较', 'Compare'),
    };
    const btnSave = {
      iconPath: new vscode.ThemeIcon('save'),
      tooltip: t('保存到默认目录', 'Save to default folder'),
    };
    const btnSaveAs = {
      iconPath: new vscode.ThemeIcon('save-as'),
      tooltip: t('另存为...', 'Save as...'),
    };

    function refreshButtons() {
      btnNext.iconPath = new vscode.ThemeIcon(
        state.hasMore ? 'chevron-down' : 'circle-slash'
      );
      btnNext.tooltip = state.hasMore
        ? t('下一组日志', 'Next page of logs')
        : t('没有更多日志', 'No more logs');
      picker.buttons = [btnNext, btnToggle, btnCompare, btnSave, btnSaveAs];
    }

    async function loadLogs() {
      const commits = await gitLog(cwd, state.offset);
      state.hasMore = commits.length > LOG_PAGE_SIZE;
      const shown = commits.slice(0, LOG_PAGE_SIZE);
      const items = [
        {
          label: '$(git-commit) HEAD',
          description: state.multi
            ? t('基线', 'Baseline')
            : t('工作区 vs HEAD', 'Working tree vs HEAD'),
          target: 'HEAD',
        },
        {
          label: '$(diff) ' + t('暂存区 (Staged)', 'Staged'),
          description: t('HEAD vs 暂存区', 'HEAD vs staged'),
          target: '__STAGED__',
        },
        ...shown.map((c) => ({
          label:
            c.subject.length > 60 ? c.subject.slice(0, 60) + '…' : c.subject,
          description: c.hash.slice(0, 8),
          target: c.hash,
        })),
      ];
      picker.items = items;
      refreshButtons();
    }

    picker.title = t('Git 差异报告', 'Git Diff Report');
    picker.placeholder = state.multi
      ? t('勾选 2 个 baseline，点「开始比较」', 'Select 2 baselines, then click Compare')
      : t(
          '点击一项即对比（vs 工作区）；点「双基线对比」出现复选框',
          'Click an item to compare vs the working tree; click "Two baselines" for checkboxes'
        );
    picker.canSelectMany = state.multi;
    picker.matchOnDescription = true;

    picker.onDidChangeSelection((sel) => {
      if (state.multi && sel.length > 2) {
        picker.selectedItems = prevSel;
        vscode.window.showWarningMessage(
          t('最多只能选两个', 'You can select at most two')
        );
      } else {
        prevSel = [...sel];
      }
    });

    picker.onDidTriggerButton(async (b) => {
      if (b === btnNext) {
        if (!state.hasMore) {
          vscode.window.showInformationMessage(
            t('没有更多日志了', 'No more logs')
          );
          return;
        }
        state.offset += LOG_PAGE_SIZE;
        await loadLogs();
      } else if (b === btnToggle) {
        state.multi = !state.multi;
        open();
      } else if (b === btnCompare) {
        await runCompare(picker, cwd);
      } else if (b === btnSave) {
        await saveReport(cwd, false);
      } else if (b === btnSaveAs) {
        picker.hide();
        await saveReport(cwd, true);
      }
    });

    picker.onDidAccept(async () => {
      await runCompare(picker, cwd);
    });

    picker.onDidHide(() => {
      if (active === picker) {
        picker.dispose();
        active = null;
      }
    });

    picker.show();
    loadLogs();
  }

  open();
}

async function runCompare(picker, cwd) {
  const sel = picker.selectedItems;
  if (sel.length === 0) {
    vscode.window.showWarningMessage(t('请先勾选对比目标', 'Select a target first'));
    return;
  }
  if (sel.length === 1) {
    const target = sel[0].target;
    if (target === '__STAGED__') {
      await generate(cwd, { staged: true });
    } else if (target === 'HEAD') {
      await generate(cwd, {});
    } else {
      await generate(cwd, { target });
    }
  } else {
    const refs = sel.map((i) => i.target);
    if (refs.includes('__STAGED__')) {
      vscode.window.showWarningMessage(
        t('暂存区不能作为双基线对比的目标', 'The staged area cannot be a two-baseline target')
      );
      return;
    }
    await generate(cwd, { refs });
  }
  picker.hide();
}

function pickFolder(cwd) {
  return new Promise((resolve) => {
    let currentDir = path.join(cwd, 'git-diff-reports');
    try {
      fs.mkdirSync(currentDir, { recursive: true });
    } catch (_) {}

    let settled = false;
    const finish = (val) => {
      if (!settled) {
        settled = true;
        resolve(val);
      }
    };

    const qp = vscode.window.createQuickPick();

    function buildItems() {
      const items = [];
      const parent = path.dirname(currentDir);
      if (parent !== currentDir) {
        items.push({
          label: '$(arrow-up)',
          description: parent,
          kind: 'up',
        });
      }
      let entries = [];
      try {
        entries = fs.readdirSync(currentDir, { withFileTypes: true });
      } catch (_) {
        entries = [];
      }
      for (const e of entries) {
        if (e.isDirectory()) {
          items.push({
            label: '$(folder) ' + e.name,
            description: '',
            kind: 'dir',
            fullPath: path.join(currentDir, e.name),
          });
        }
      }
      return items;
    }

    function refresh() {
      qp.items = buildItems();
      qp.placeholder = currentDir;
    }

    qp.title = t('选择保存目录', 'Select save folder');
    qp.placeholder = currentDir;
    qp.items = buildItems();

    const btnUp = {
      iconPath: new vscode.ThemeIcon('arrow-up'),
      tooltip: t('上一层', 'Up one level'),
    };
    const btnSelect = {
      iconPath: new vscode.ThemeIcon('check'),
      tooltip: t('选中当前目录', 'Select this folder'),
    };
    qp.buttons = [btnUp, btnSelect];

    qp.onDidAccept(() => {
      const sel = qp.selectedItems[0];
      if (!sel) {
        return;
      }
      if (sel.kind === 'up') {
        currentDir = path.dirname(currentDir);
        refresh();
      } else if (sel.kind === 'dir') {
        currentDir = sel.fullPath;
        refresh();
      }
    });

    qp.onDidTriggerButton((b) => {
      if (b === btnUp) {
        const parent = path.dirname(currentDir);
        if (parent !== currentDir) {
          currentDir = parent;
          refresh();
        }
      } else if (b === btnSelect) {
        finish(currentDir);
        qp.hide();
      }
    });

    qp.onDidHide(() => {
      qp.dispose();
      finish(null);
    });

    qp.show();
  });
}

async function saveReport(cwd, saveAs) {
  const defaultDir = path.join(cwd, 'git-diff-reports');
  let dest;
  if (saveAs) {
    const folder = await pickFolder(cwd);
    if (!folder) {
      return;
    }
    dest = path.join(folder, `git-diff-report-${Date.now()}.html`);
  } else {
    fs.mkdirSync(defaultDir, { recursive: true });
    dest = path.join(defaultDir, `git-diff-report-${Date.now()}.html`);
  }

  if (!lastReportPath || !fs.existsSync(lastReportPath)) {
    vscode.window.showWarningMessage(
      t('还没有生成报告，请先比较一次再保存', 'No report yet. Generate one before saving.')
    );
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(lastReportPath, dest);
  vscode.window.showInformationMessage(
    t('报告已保存：', 'Report saved: ') + dest
  );
}

function deactivate() {
  if (reportServer) {
    reportServer.close();
    reportServer = null;
  }
}

module.exports = { activate, deactivate };
