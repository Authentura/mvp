import * as vscode from 'vscode';
import {Line, Issue, Explanation, IssueMap, IssueObject } from "./types";

let decorations: vscode.Disposable[] = [];

function createHoverWithButton(range: vscode.Range, message: string, issue: IssueObject): vscode.Hover {
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`<span style="font-size: 20px;">${message}</span>\n\n`); // Adjust the font-size value as desired/div><>
    markdown.appendMarkdown(
        // TODO: replace this with the correct command
      `[Explain Me](command:authenguard.explain?${encodeURIComponent(JSON.stringify(issue))})`
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

export function clearIssues() {
    decorations.forEach(decoration => decoration.dispose());
    decorations = [];
}


export function displayIssues(issues: IssueObject[], editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    const document = editor.document;
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
            provideHover(_document, position , _token): vscode.Hover | undefined {
                if (range.contains(position)) {
                    return createHoverWithButton(range, issueTitle, issue);
                }
            }
        });

        
        // Add to an array so the event listeners can be added to it
        decorations.push(hoverProvider);
        decorations.push(highlightDecorationType);

        // Make sure the diagnostics get removed
        context.subscriptions.push(hoverProvider);
        context.subscriptions.push(highlightDecorationType);
    });

    // Clear issues when the document changes
    vscode.workspace.onDidOpenTextDocument(() => {
        clearIssues();
    });

    // Clear issues when the editor changes
    vscode.window.onDidChangeActiveTextEditor(() => {
        clearIssues();
    });
};


export function displayExplanation(issue: IssueObject, editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    const document = editor.document;
    
    const range: vscode.Range = issue.range;
    const issueBody = issue.body;
    const line = issue.range.start.line;
    
    
    // Create the highlight message
    const hoverProvider = vscode.languages.registerHoverProvider("*", {
        provideHover(_document, position , _token): vscode.Hover | undefined {
            if (range.contains(position)) {
                return createExplainHover(range, issueBody, issue);
            }
        }
    });
    
    // Make sure the diagnostics get removed
    context.subscriptions.push(hoverProvider);

    vscode.window.onDidChangeTextEditorSelection(() => {
        hoverProvider.dispose();
    });
}