import * as vscode from "vscode";

export type Line = number;
export type Issue = string;
export type Explanation = string;

type IssueMap = Map<Line, [Issue, Explanation][]>;

export interface Response {
  issues?: IssueMap;
}

export const parseBody = (
  body: string,
  outputLogger: vscode.OutputChannel
): Response => {
  const lineRegexp = /- \[([0-9]+)\], (\w.+), (\w.+)/;
  const res = {} as Response;

  for (let line of body.split("\n")) {
    if (!res.issues) {
      res.issues = new Map();
    }

    const matches = lineRegexp.exec(line);

    if (!matches) {
      outputLogger.appendLine("No matches");
      return {} as Response;
    }

    const [lineNumber, issue, explanation] = [
      Number(matches[1].trim()),
      matches[2].trim(),
      matches[3].trim(),
    ];

    let item = res.issues.get(lineNumber);

    if (item) {
      item.push([issue, explanation]);
    } else {
      item = [[issue, explanation]];
      res.issues.set(lineNumber, item);
    }
  }

  return res;
};
