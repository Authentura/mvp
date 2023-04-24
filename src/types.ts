
export type Line = number;

export type Issue = string;
export type Explanation = string;

export type IssueMap = Map<Line, [Issue, Explanation]>;

export type IssueObject = {
    line: Line,
    title: Issue,
    body: Explanation
};