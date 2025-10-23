import * as vscode from 'vscode';
import { isConfigured } from "../utils/utils.js";
import { LlmModel } from '../features/llmModel.js';
import { generateResponse } from '../features/template.js';
import { appendToEditor } from '../utils/utils.js';

async function* generateStream(input: any) {
	const chunks: string[] = [];

  for await (const chunk of input) {
    chunks.push(chunk.content);
  }

  for (let i = 0; i < chunks.length; i++) {
    const isFirst = i === 0;
    const isLast = i === chunks.length - 1;

    let result = chunks[i];
    if (isFirst) {
      result = result.slice(3);
    }
    if (isLast) {
      result = result.slice(0, -3);
    }

    yield result;
  }
}

const generateTests = async () => {
  if(!isConfigured()) {
    const choice = await vscode.window.showInformationMessage(
      'Extension is not configured yet. Please setup before you continue.',
      'Setup',
      'Cancel'
    )
    if(choice === 'Setup') {
      await vscode.commands.executeCommand('unitTestGen.setup');
    } else {
      return;
    }
  } else {
    const config = vscode.workspace.getConfiguration('unitTestGen');
    const llmModel = config.get<string>('llmModel');
    const apiKey = config.get<string>('apiKey');
    LlmModel.initializeInstance(llmModel as string, apiKey as string);
  }

  const editor = vscode.window.activeTextEditor;
  if(!editor) {
    vscode.window.showErrorMessage('No active editor!');
    return;
  }
  const document = editor.document;
  const fileContent = document.getText();
  const llm = LlmModel.getInstance();
  
  const recievedResponse = await generateResponse(llm.model, fileContent);
  const stream = generateStream(recievedResponse);

  const currentFileUri = document.uri;

  const folderUri = vscode.Uri.joinPath(currentFileUri, "..");
  const fileName = currentFileUri.path.split("/").pop();
  if(!fileName) return;

  const [name, ext] = fileName.split(".");

  const newFileName = `${name}.test.${ext}`;
  const newFileUri = vscode.Uri.joinPath(folderUri, newFileName);
  await vscode.workspace.fs.writeFile(newFileUri, new Uint8Array());

  const doc = await vscode.workspace.openTextDocument(newFileUri);
  const newEditor = await vscode.window.showTextDocument(doc);

  for await (const chunk of stream) {
    await appendToEditor(newEditor, chunk);
  }
}

export default generateTests;