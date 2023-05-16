import * as vscode from "vscode";

export type Line = number;
export type Issue = string;
export type Explanation = string;

export type IssueMap = Map<Line, [Issue, Explanation]>;

export type IssueObject = {
    range: vscode.Range, // The range at which the highlight will be.
    title: Issue, // name of vulnerability
    body: Explanation, // explanation
    code: string // original code that the issue was found in
                 //   this last one is useful for generating explanations
};
