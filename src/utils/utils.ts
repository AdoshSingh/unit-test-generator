import * as vscode from 'vscode';

export async function appendToEditor(editor: vscode.TextEditor, text: string) {
  await editor.edit(editBuilder => {
    const lastLine = editor.document.lineCount;
    editBuilder.insert(new vscode.Position(lastLine, 0), text);
  });
}

export function isConfigured() {
  const config = vscode.workspace.getConfiguration('unitTestGen');
  const llmModel = config.get<string>('llmModel');
  const apiKey = config.get<string>('apiKey');
  return !!llmModel && !!apiKey;
}