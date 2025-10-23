import * as vscode from 'vscode';
import { isConfigured } from "../utils/utils.js";
import { models } from '../utils/constants.js';
import { LlmModel } from '../features/llmModel.js';

const setup = async () => {
  if(isConfigured()) {
    vscode.window.showInformationMessage('Extension is already configured');
    return;
  }

  const llmModel = await vscode.window.showQuickPick(models, {
    placeHolder: "Select a model"
  });
  if(!llmModel) {
    vscode.window.showWarningMessage('You must select a model to continue.');
    return;
  }

  const apiKey = await vscode.window.showInputBox({
    prompt: 'Enter your API key.',
  });
  if(!apiKey){
    vscode.window.showWarningMessage('You enter your API key to generate the tests.');
    return;
  }

  const config = vscode.workspace.getConfiguration('unitTestGen');
  await config.update('llmModel', llmModel, vscode.ConfigurationTarget.Global);
  await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);

  LlmModel.initializeInstance(llmModel, apiKey);
}

export default setup;