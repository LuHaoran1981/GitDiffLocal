const vscode = require('vscode');
const { execFile } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// The report is a single self-contained HTML file (inline CSS + JS, no external
// resources). VSCode webviews block inline scripts by default, so we inject a
// permissive CSP into the <head> before loading it.
const CSP =
  '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; ' +
  'style-src \'unsafe-inline\'; script-src \'unsafe-inline\';">';

function activate(context) {
  const disposable = vscode.commands.registerCommand(
    'gitdiffhtml.generateReport',
    async (arg) => {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage(
          'GitDiff: open a folder or workspace first.'
        );
        return;
      }
      const cwd = folders[0].uri.fsPath;

      // Optional file/folder filter from a context-menu invocation.
      const targetUri = normalizeUri(arg);
      let fileFilter = null;
      if (targetUri) {
        const rel = path.relative(cwd, targetUri.fsPath);
        if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
          fileFilter = rel;
        }
      }

      const scriptPath = path.join(context.extensionPath, 'git_diff_html.py');
      const outPath = path.join(
        os.tmpdir(),
        `git-diff-report-${Date.now()}.html`
      );
      const args = [scriptPath, '--no-open', '-o', outPath];
      if (fileFilter) {
        args.push(fileFilter);
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'GitDiff: generating HTML report...',
          cancellable: false,
        },
        () =>
          new Promise((resolve) => {
            execFile(pythonCommand(), args, { cwd }, (err, stdout, stderr) => {
              if (err) {
                const msg = (stderr || stdout || err.message).trim();
                vscode.window.showErrorMessage(`GitDiff: ${msg}`);
                resolve();
                return;
              }
              if (!fs.existsSync(outPath)) {
                vscode.window.showErrorMessage(
                  'GitDiff: report was not generated.'
                );
                resolve();
                return;
              }
              showReport(outPath);
              resolve();
            });
          })
      );
    }
  );

  context.subscriptions.push(disposable);
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
  const panel = vscode.window.createWebviewPanel(
    'gitdiffhtml.report',
    'Git Diff Report',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );
  panel.webview.html = html.replace(/<head>/i, '<head>\n' + CSP);
}

function deactivate() {}

module.exports = { activate, deactivate };
