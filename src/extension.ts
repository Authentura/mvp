import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Set up an output logger
    const outputLogger = vscode.window.createOutputChannel("authentura-mvp");
    // make sure it gets disposed of when not needed
    context.subscriptions.push(outputLogger);
    outputLogger.show(true);
    outputLogger.appendLine("Initialised");

    // The scan command has been defined in the package.json file
    let scanCommand = vscode.commands.registerCommand('authentura-mvp.scan', () => {

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello, World!');
    });

    context.subscriptions.push(scanCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}