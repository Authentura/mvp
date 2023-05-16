import * as vscode from 'vscode';

function simpleTokenizer(code: string): string[] {
    const regex = /[\w]+|[^\s\w]+/g;
    return code.match(regex) || [];
}

// fucntion tries to get x amount of tokens from above and below the cursor.
// This is needed due to the token limit of gpt models.
// NOTE: all of this code was written by GPT, it might have issues.
// TODO: if the cursor is at the bottom or the top of the file we will get less tokens. This should be fixed
export function getCodeAroundCursor(cursorPosition: vscode.Position, targetTokenCount: number): vscode.Range {
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