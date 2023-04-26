import { OutgoingMessage } from 'http';
import * as vscode from 'vscode';
import {Line, Issue, Explanation, IssueMap, IssueObject } from "./types";

// keep track of all diagnostics that are currently displayed
let DIAGNOSTICS: vscode.DiagnosticCollection;
let ISSUES: IssueObject[] = [];
let isManualSave = false;

function simpleTokenizer(code: string): string[] {
    const regex = /[\w]+|[^\s\w]+/g;
    return code.match(regex) || [];
}

// fucntion tries to get x amount of tokens from above and below the cursor.
// This is needed due to the token limit of gpt models.
// NOTE: all of this code was written by GPT, it might have issues.
// TODO: if the cursor is at the bottom or the top of the file we will get less tokens. This should be fixed
function getCodeAroundCursor(cursorPosition: vscode.Position, targetTokenCount: number): vscode.Range {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('No active editor found!');
    }

    const document = editor.document;
    const totalLines = document.lineCount;

    let tokensAbove = 0;
    let tokensBelow = 0;
    let startLine = cursorPosition.line;
    let endLine = cursorPosition.line;

    // Get tokens above the cursor
    while (startLine > 0 && tokensAbove < targetTokenCount / 2) {
        const lineTokens = simpleTokenizer(document.lineAt(startLine).text);
        tokensAbove += lineTokens.length;
        startLine--;
    }

    // Get tokens below the cursor
    while (endLine < totalLines - 1 && (tokensBelow < targetTokenCount / 2 || tokensAbove + tokensBelow < targetTokenCount)) {
        endLine++;
        const lineTokens = simpleTokenizer(document.lineAt(endLine).text);
        tokensBelow += lineTokens.length;
    }

    
    const start = new vscode.Position(startLine, 0);
    const end = new vscode.Position(endLine, document.lineAt(endLine).text.length);
    const selectedRange = new vscode.Range(start, end);
    return selectedRange;
}

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
            // This is a very dirty way of storing the id of the issue,
            //  and I am terribly sorry for whoever will have to deal with
            //  this in the future :/
            `${issueTitle}\n\n${issueBody}\n(ID:${ISSUES.indexOf(issue)})`,
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
    outputLogger.appendLine("Authentura Scanner is monitoring!");
    


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
        const codeRange = getCodeAroundCursor(editor.selection.active, 500);
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
                codeRange,
                filePath,
                projectPath,
                outputLogger,
                editor
            )
            .then((issues) => {
                // Keep track of all issues
                ISSUES = [...ISSUES, ...issues];

                displayIssues(issues);
            })
            .catch((error) => {
                vscode.window.showErrorMessage("Error while makeing api request: ", error);
            });
        });
        
    });
    context.subscriptions.push(scanCommand);
    

    // Register this scan command on save.
    // NOTE: we might not want this in the future as it could get expensive, however I think it might be useful
    //
    // Listen for the onWillSaveTextDocument event
    context.subscriptions.push(
        vscode.workspace.onWillSaveTextDocument((e: vscode.TextDocumentWillSaveEvent) => {
            // Set the isManualSave flag to true if the reason is manual save
            isManualSave = e.reason === vscode.TextDocumentSaveReason.Manual;
        })
    );
    // Listen for the onDidSaveTextDocument event
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

// This method is called when your extension is deactivated
export function deactivate() {}