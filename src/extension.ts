import * as vscode from 'vscode';
import setup from './commands/setup.js';
import generateTests from './commands/generateTests.js';

export function activate(context: vscode.ExtensionContext) {
	const disposableSetup = vscode.commands.registerCommand('unitTestGen.setup', setup);
	context.subscriptions.push(disposableSetup);
	const disposableAction = vscode.commands.registerCommand('unitTestGen.generateTests', generateTests);
	context.subscriptions.push(disposableAction);
}

export function deactivate() {}
