import { OutgoingMessage } from 'http';
import * as vscode from 'vscode';
import { getCodeAroundCursor } from "./tokens";
import { displayExplanation, displayIssues } from './customDiagnostics';
import {Line, Issue, Explanation, IssueMap, IssueObject } from "./types";
import { isMainThread } from 'worker_threads';


// Some global variables
let isManualSave = false;
let authenguardStatus: boolean = false;
let authenguardToggle: vscode.StatusBarItem;


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
    

    

    // ------------> The explain command
    type TmpIssueObject = {
        range: Array<any>,
        title: Issue,
        body: Explanation,
        code: string
        rejected: boolean
    };
    let explainCommand = vscode.commands.registerCommand("authentura-mvp.explain", (params: TmpIssueObject) => {
        vscode.window.showInformationMessage("Explanation called");

        // These few lines are needed to fix the issueObject after it got stringified
        let { range , title, code, rejected } = params;
        let newRange = new vscode.Range(
            range[0].line,
            range[0].character,
            range[1].line,
            range[1].character,
        );
        const issueObject: IssueObject = {
            range: newRange,
            title,
            code,
            body: "",
            rejected
        };
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("No active editor!");
            return;
        }
        import("./modules/gpt-explain").then((module) => {
            module.run(
                issueObject,
                outputLogger,
                editor
            )
            .then((issue) => {
                vscode.window.showInformationMessage(issue.body);;
                displayExplanation(issueObject, editor, context);
            })
            .catch((error) => {
                outputLogger.append("Error while makeing api request: "+ error);
            });
        });
    });
    context.subscriptions.push(explainCommand);


    

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
            if (isManualSave && authenguardStatus) {
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
    


    // ------------> Status bar toggle
    let toggleCommand = vscode.commands.registerCommand("authentura-mvp.onoff", (params: TmpIssueObject) => {

        if (!authenguardStatus) {
            authenguardToggle.text = "Authenguard active! Stay safe";
            authenguardStatus = true;
            vscode.commands.executeCommand("authentura-mvp.scan");
        }
        else {
            authenguardToggle.text = "Authenguard is off";
            authenguardStatus = false;
        }
    });
    authenguardToggle = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    if (authenguardToggle) {
        authenguardToggle.command = "authentura-mvp.onoff";
        authenguardToggle.text = "Authenguard is off";
        authenguardToggle.show();
    }
}

export function deactivate() {}