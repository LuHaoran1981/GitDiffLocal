const vscode = require('vscode');
const { execFile } = require('child_process');
const http = require('http');
const path = require('path');
const os = require('os');
const fs = require('fs');

let extensionPath = null;
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
      await generate(cwd, { files: fileFilter ? [fileFilter] : [] });
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

function generate(cwd, opts) {
  return new Promise((resolve) => {
    const scriptPath = path.join(extensionPath, 'git_diff_html.py');
    const outPath = path.join(os.tmpdir(), `git-diff-report-${Date.now()}.html`);
    const args = [scriptPath, '--no-open', '-o', outPath];
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
            showReport(outPath);
            res();
          });
        })
    ).then(resolve);
  });
}

function deactivate() {
  if (reportServer) {
    reportServer.close();
    reportServer = null;
  }
}

module.exports = { activate, deactivate };
