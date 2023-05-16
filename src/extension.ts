import { OutgoingMessage } from 'http';
import * as vscode from 'vscode';
import { getCodeAroundCursor } from "./tokens";
import { displayIssues } from './customDiagnostics';
import {Line, Issue, Explanation, IssueMap, IssueObject } from "./types";
import { isMainThread } from 'worker_threads';


// Some global variables
let isManualSave = false;


export function activate(context: vscode.ExtensionContext) {
    // Set up the logger
    const outputLogger = vscode.window.createOutputChannel("authentura-mvp");
    context.subscriptions.push(outputLogger);
    outputLogger.show(true);
    outputLogger.appendLine("Authenguard is active!");
    
    // ------------> Scan command
    // Command runs the authenguard scanner on the current position of the cursor
    let scanCommand = vscode.commands.registerCommand('authentura-mvp.scan', () => {
        // Ignore if there is no open editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("No active editor!");
            return;
        }
        // TODO: load any extra modules
        
        // Load the GPT module
        // Get an appropriate amount of code around the cursor for the GPT context size
        const codeRange = getCodeAroundCursor(editor.selection.active, 500);
        import("./modules/gpt-classify").then((module) => {
            module.run(
                codeRange,
                outputLogger,
                editor
            )
            .then((issues) => {
                displayIssues(issues, editor, context);
            })
            .catch((error) => {
                vscode.window.showErrorMessage("Error while makeing api request: ", error);
            });
        });
    });
    context.subscriptions.push(scanCommand);
    

    


    // NOTE: place for other commands in the future


    

    // ------------> Set up scan on save if the extension is already active
    // make sure its not an autosave run. We don't want to waste money
    context.subscriptions.push(
        vscode.workspace.onWillSaveTextDocument((e: vscode.TextDocumentWillSaveEvent) => {
            isManualSave = e.reason === vscode.TextDocumentSaveReason.Manual;
        })
    );
    // Set up the on save listener
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => {
            if (isManualSave) {
                try {
                    // Execute the authentura-mvp.scan command
                    await vscode.commands.executeCommand('authentura-mvp.scan');
                } catch (error) {
                    const errorMsg = (error as Error).message;
                    vscode.window.showErrorMessage(`Failed to execute command: ${errorMsg}`);
                }
            }
            // Reset the isManualSave flag
            isManualSave = false;
        })
    );
}

export function deactivate() {}