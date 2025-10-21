import * as vscode from 'vscode';

class LlmModel {
	model: string;
	apiKey: string;
	public static instance: LlmModel;

	private constructor(model: string, apiKey: string) {
		this.model = model;
		this.apiKey = apiKey;
	}

	public static initializeInstance(model: string, apiKey: string) {
		if(!LlmModel.instance) {
			LlmModel.instance = new LlmModel(model, apiKey);
		}
		return LlmModel.instance;
	}

	public static getInstance() {
    if (!LlmModel.instance) {
      throw new Error('LlmModel is not initialized. Call initializeFromConfig first.');
    }
    return LlmModel.instance;
  }
}


async function appendToEditor(editor: vscode.TextEditor, text: string) {
  await editor.edit(editBuilder => {
    const lastLine = editor.document.lineCount;
    editBuilder.insert(new vscode.Position(lastLine, 0), text);
  });
}

// Simulated streaming function (replace with LLM later)
async function* sampleFn(input: string) {
  yield `// Unit tests for file:\n// ${input.substring(0, 30)}...\n\n`;
  yield "describe('add', () => {\n";
  yield "  it('should add numbers', () => {\n";
  yield "    expect(add(1,2)).toBe(3);\n";
  yield "  });\n";
  yield "});\n";
}

function isConfigured() {
	const config = vscode.workspace.getConfiguration('unitTestGen');
	const llmModel = config.get<string>('llmModel');
	const apiKey = config.get<string>('apikey');
	return !!llmModel && !!apiKey;
}

export function activate(context: vscode.ExtensionContext) {

	const disposableSetup = vscode.commands.registerCommand('unitTestGen.setup', async () => {
		if(isConfigured()) {
			vscode.window.showInformationMessage('Extension is already configured');
			return;
		}

		const llmModel = await vscode.window.showQuickPick(['gpt-4'], {
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
	});

	context.subscriptions.push(disposableSetup);

	const disposableAction = vscode.commands.registerCommand('unitTestGen.generateTests', async () => {

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
		}

		const llm = LlmModel.getInstance();
		console.log(llm.model, llm.apiKey);

		const editor = vscode.window.activeTextEditor;
		if(!editor) {
			vscode.window.showErrorMessage('No active editor!');
			return;
		}
		const document = editor.document;
		const fileContent = document.getText();

		const stream = sampleFn(fileContent);

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
	});

	context.subscriptions.push(disposableAction);
}

export function deactivate() {}
