import { OutgoingMessage } from 'http';
import * as vscode from 'vscode';
import {Line, Issue, Explanation, IssueMap, IssueObject } from "./types";

// keep track of all diagnostics that are currently displayed
let DIAGNOSTICS: vscode.DiagnosticCollection;


// Function to clear all then reset the current diagnostics
// function resetDiagnostics

function displayIssues(issues: IssueObject[]) {
    const _diagnostics: vscode.Diagnostic[] = [];

    // get the editor and document
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("Could not get editor context");
        return;
    }
    const document = editor.document;
    

    issues.forEach((issue) => {
        const line = issue.line;
        const issueTitle = issue.title;
        const issueBody = issue.body;
        
        // log
        vscode.window.showInformationMessage(`${line}: ${issueTitle}`);


        // Calculate the size of the line that needs to be highlighted
        const lineText = editor.document.lineAt(line).text;
        if (!lineText) {
            return;
        }
        const lineStart = lineText.length - lineText.trimStart().length;
        const lineLength = lineText.length -1;


        let range: vscode.Range;
        // Create a range for where to show the diagnostic
        // TODO: If this line lands on an empty line then it shows nothing
        //        to the user. We should probably fix that at some point.
        range = new vscode.Range(
            // NOTE: gpt can often be very bad at finding the exact
            //       line an issue is on. These +2 and -1 lines should
            //       help a little, but in the long term we shuld just
            //       increase its accuracy.
            line -2,
            lineStart,
            line,
            lineLength
        );
        
        _diagnostics.push(new vscode.Diagnostic(
            range,
            `${issueTitle}\n\n${issueBody}`,
            vscode.DiagnosticSeverity.Information
        ));
    });
    
    // Set the new diagnostics
    DIAGNOSTICS.set(document.uri, _diagnostics);
}

export function activate(context: vscode.ExtensionContext) {
    // Set up an output logger
    const outputLogger = vscode.window.createOutputChannel("authentura-mvp");
    // make sure it gets disposed of when not needed
    context.subscriptions.push(outputLogger);
    outputLogger.show(true);
    outputLogger.appendLine("Initialised");
    


    // Set up a diagnostics collection so we can manage them
    DIAGNOSTICS = vscode.languages.createDiagnosticCollection(
        "authentura-mvp.vulnerability-diagnostics"
    );
    context.subscriptions.push(DIAGNOSTICS);
    

    // The scan command has been defined in the package.json file
    let scanCommand = vscode.commands.registerCommand('authentura-mvp.scan', () => {
        // Ignore if there is no open editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        
        // get the document
        const document = editor.document;

        // Ignore plain text and untitled documents
        // TODO: by default this ignores solidity. Take a look if an extension can fix this or you have to do it yoursefl
        if (document.languageId === "plaintext" || document.isUntitled) {
            vscode.window.showInformationMessage(
                "Cannot check security of plain text or untitled windows."
            );
            return;
        }
        
        // Collect the data
        // TODO: body should only be a certain range of code later
        const body: string = document.getText();
        const filePath: string = editor.document.uri.fsPath;
        let projectPath: string = "";

        
        // Get the open project path
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const workspaceFolder = workspaceFolders[0];
            projectPath = workspaceFolder.uri.fsPath;
        } else {
            vscode.window.showErrorMessage("No workspace open");
            return;
        }


        // TODO: figure out what modules need to be loaded



        // Load the GPT module
        import("./modules/gpt-classify").then((module) => {
            module.run(
                body,
                filePath,
                projectPath,
                outputLogger,
                editor
            )
            .then((issues) => {
                displayIssues(issues);
            })
            .catch((error) => {
                vscode.window.showErrorMessage("Error while makeing api request: ", error);
            });
        });
        
        
    });

    context.subscriptions.push(scanCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}