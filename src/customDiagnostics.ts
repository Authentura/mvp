import * as vscode from 'vscode';
import {Line, Issue, Explanation, IssueMap, IssueObject } from "./types";


function createHoverWithButton(range: vscode.Range, message: string): vscode.Hover {
    const markdown = new vscode.MarkdownString();
    markdown.appendText(message + '\n\n');
    markdown.appendMarkdown(
        // TODO: replace this with the correct command
      `[Explain Me](command:my-hover-extension.explainIssue?${encodeURIComponent(JSON.stringify({ message }))})`
    );
    markdown.isTrusted = true;
    return new vscode.Hover(markdown, range);
}




export function displayIssues(issues: IssueObject[], editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    const document = editor.document;
    const decorationInstances: vscode.TextEditorDecorationType[] = [];

    issues.forEach((issue) => {
        const range = issue.range;
        const issueTitle = issue.title;
        const line = issue.range.start.line;

        // TODO: if the issue already has a body then
        //       display it instead of the explainme message
        //const issueBody = issue.body; 
        
        // some debugging
        vscode.window.showInformationMessage(`${line}: ${issueTitle}`);
        
        // Create a highlight
        let highlightDecorationType: vscode.TextEditorDecorationType | null;
        highlightDecorationType = vscode.window.createTextEditorDecorationType({
            textDecoration: "underline",
            borderColor: "rgb(0, 0, 255)"
        });
        
        // Create the highlight message
        editor.setDecorations(highlightDecorationType, [range]);
        const hoverProvider = vscode.languages.registerHoverProvider("*", {
            provideHover(_document, _position , _token): vscode.Hover {
                return createHoverWithButton(range, issueTitle);
            }
        });
        
        // Add to an array so the event listeners can be added to it
        decorationInstances.push(highlightDecorationType);

        // Make sure the diagnostics get removed
        context.subscriptions.push(hoverProvider);
        context.subscriptions.push(highlightDecorationType);
    });
    
    // Create an eventlistener that removes all the highlights if they are
    // no longer needed
    // NOTE: if there is an issue around multiple errors being removed when
    //       only one should be in the future, then its this things fault.
    vscode.window.onDidChangeTextEditorSelection(() => {
        decorationInstances.forEach((decorationInstance) => {
            editor.setDecorations(decorationInstance, []);
            decorationInstance.dispose();
        });
    });


    // TODO: maybe return an array with both the issue and the diagnostics
    //       so later it can be deleted if the user says presses ignore
};