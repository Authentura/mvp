import * as vscode from 'vscode';
import * as request from 'request';


export function activate(context: vscode.ExtensionContext) {
	let makeRequestDisposable = vscode.commands.registerCommand('authentura-mvp.helloWorld', () => {
		
		// Dont do anything if there is no active editor
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		
		// Get the currnet text from the editor
		const document = editor.document;
		
		// Ignore plain text and untitled documents
		if (document.languageId === 'plaintext' || document.isUntitled) {
			vscode.window.showInformationMessage("Cannot check security of plain text or untitled windows.");
			return;
		}
		
		const code = document.getText();
		

		// Make the request to our server
		request.post({
			url: "http://localhost:3000/check/3",
			headers: {
				"Content-Type": "application/json",
				"Cookie": "token=e0f25945-becd-4e8d-a372-278b90597fee"
			},
			json: {
				username: "admin",
				code: code
			},
		}, (error: { message: string; }, response: { message: string; }, body: any) => {
			if (error) {
				vscode.window.showErrorMessage("Error making API request: " + error.message);
			}
			else {
				vscode.window.showInformationMessage(body);
			}
		});
	});
	
	// Add the command
	context.subscriptions.push(makeRequestDisposable);
}

export function deactivate() {}
