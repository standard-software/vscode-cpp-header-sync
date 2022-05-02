const vscode = require('vscode');
const {
  _isLast,
  _subFirstDelimLast,
} = require('./parts/parts.js')

function activate(context) {

  const registerCommand = (commandName, func) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        commandName, func
      )
    );
  };

  const extensionMain = (commandName) => {

    let editor = vscode.window.activeTextEditor;
    if ( !editor ) {
      vscode.window.showInformationMessage(`No editor is active.`);
      return;
    }

    switch (commandName) {

    case `ToHeaderFile`: {
      const uri = vscode.window.activeTextEditor.document.uri;
      const { path } = uri;
      if (_isLast(path.toLowerCase(), `.h`)) {
        return;
      }
      const headerFilePath = _subFirstDelimLast(path, `.`) + `.h`;

      const openPath = vscode.Uri.parse("file://" + headerFilePath);
      vscode.workspace.openTextDocument(openPath).then(doc => {

        const selectTexts = [];
        const selections = editor.selections;
        for (const selection of selections) {

          const range = new vscode.Range(
            selection.start.line,
            selection.start.character,
            selection.end.line,
            selection.end.character,
          );
          selectTexts.push(editor.document.getText(range));
        }

        vscode.window.showTextDocument(doc).then(() => {
          editor = vscode.window.activeTextEditor;
          if ( !editor ) {
            vscode.window.showInformationMessage(`No editor is active.`);
            return;
          }

          let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
          for (const text of selectTexts) {

            editor.edit((editBuilder) => {
              editBuilder.replace(lastLine.range.end, text);
            });
          }
        });

      }).catch(e => {
        vscode.window.showInformationMessage(`${e.name} ${e.message}`);
      });

    }; break;

    case `ToCppFile`:{
      const uri = vscode.window.activeTextEditor.document.uri;
      const { path } = uri;
      if (_isLast(path.toLowerCase(), `.c`)) {
        return;
      }
      if (_isLast(path.toLowerCase(), `.cpp`)) {
        return;
      }

      const cFilePath = _subFirstDelimLast(path, `.`) + `.c`;
      const cppFilePath = _subFirstDelimLast(path, `.`) + `.cpp`;

      const selectTexts = [];
      const selections = editor.selections;
      for (const selection of selections) {

        const range = new vscode.Range(
          selection.start.line,
          selection.start.character,
          selection.end.line,
          selection.end.character,
        );
        selectTexts.push(editor.document.getText(range));
      }

      const openPath = vscode.Uri.parse("file://" + cFilePath);
      vscode.workspace.openTextDocument(openPath).then(doc => {
        vscode.window.showTextDocument(doc).then(() => {
          editor = vscode.window.activeTextEditor;
          if ( !editor ) {
            vscode.window.showInformationMessage(`No editor is active.`);
            return;
          }

          let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
          for (const text of selectTexts) {

            editor.edit((editBuilder) => {
              editBuilder.replace(lastLine.range.end, text);
            });
          }
        });
      }).catch(e => {

        const openPath = vscode.Uri.parse("file://" + cppFilePath);
        vscode.workspace.openTextDocument(openPath).then(doc => {
          vscode.window.showTextDocument(doc).then(() => {
            editor = vscode.window.activeTextEditor;
            if ( !editor ) {
              vscode.window.showInformationMessage(`No editor is active.`);
              return;
            }

            let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
            for (const text of selectTexts) {

              editor.edit((editBuilder) => {
                editBuilder.replace(lastLine.range.end, text);
              });
            }
          });

        }).catch(e => {
          vscode.window.showInformationMessage(`${e.name} ${e.message}`);
        });
      });

    }; break;

    default:
      new Error(`extensionMain commandName:${commandName}`);
    }

  }

  registerCommand(`CppHeaderSync.ToHeaderFile`, () => {
    extensionMain(`ToHeaderFile`);
  });
  registerCommand(`CppHeaderSync.ToCppFile`, () => {
    extensionMain(`ToCppFile`);
  });

}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
