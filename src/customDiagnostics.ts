import * as vscode from 'vscode';
import {Line, Issue, Explanation, IssueMap, IssueObject } from "./types";


function createHoverWithButton(range: vscode.Range, message: string, issue: IssueObject): vscode.Hover {
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`<span style="font-size: 20px;">${message}</span>\n\n`); // Adjust the font-size value as desired
    markdown.appendMarkdown(
        // TODO: replace this with the correct command
      `[Explain Me](command:authentura-mvp.explain?${encodeURIComponent(JSON.stringify(issue))})`
    );
    markdown.isTrusted = true;
    return new vscode.Hover(markdown, range);
}

function createExplainHover(range: vscode.Range, message: string, issue: IssueObject): vscode.Hover {
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`<span style="font-size: 20px;">${message}</span>\n\n`); // Adjust the font-size value as desired
    markdown.isTrusted = true;
    return new vscode.Hover(markdown, range);
}



export function displayIssues(issues: IssueObject[], editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    const document = editor.document;
    const decorations: vscode.Disposable[] = [];
    const decorationInstances: vscode.TextEditorDecorationType[] = [];

    issues.forEach((issue) => {
        const range = issue.range;
        const issueTitle = issue.title;
        const line = issue.range.start.line;

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
                return createHoverWithButton(range, issueTitle, issue);
            }
        });
        
        // Add to an array so the event listeners can be added to it
        decorations.push(hoverProvider);
        decorations.push(highlightDecorationType);

        // Make sure the diagnostics get removed
        context.subscriptions.push(hoverProvider);
        context.subscriptions.push(highlightDecorationType);
    });
    
    // Create an eventlistener that removes all the highlights if they are
    // no longer needed
    // NOTE: if there is an issue around multiple errors being removed when
    //       only one should be in the future, then its this things fault.
    vscode.window.onDidChangeTextEditorSelection(() => {
        decorations.forEach((decoration) => {
            // editor.setDecorations(decoration, []);
            decoration.dispose();
        });
    });


    // TODO: maybe return an array with both the issue and the diagnostics
    //       so later it can be deleted if the user says presses ignore
};


export function displayExplanation(issue: IssueObject, editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    const document = editor.document;
    
    const range: vscode.Range = issue.range;
    const issueBody = issue.body;
    const line = issue.range.start.line;
    
    
    // Create the highlight message
    const hoverProvider = vscode.languages.registerHoverProvider("*", {
        provideHover(_document, _position , _token): vscode.Hover {
            return createExplainHover(range, issueBody, issue);
        }
    });
    
    // Make sure the diagnostics get removed
    context.subscriptions.push(hoverProvider);

    vscode.window.onDidChangeTextEditorSelection(() => {
        hoverProvider.dispose();
    });
}
