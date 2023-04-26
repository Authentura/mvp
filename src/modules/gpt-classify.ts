import * as vscode from "vscode";
import { promisify } from 'util';
import * as request from "request";
import {Line, Issue, Explanation, IssueMap, IssueObject } from "../types";

const MODEL = 'curie:ft-personal-2023-04-12-13-08-55';
// all of these will have to change eventually
const SERVER = "http://localhost:3000/classify/";
const HARDCODE_COOKIE = "token=e0f25945-becd-4e8d-a372-278b90597fee";
const HARDCODE_USERNAME = "admin";





export const run = (
    codeRange: vscode.Range,
    // These two arguments are not needed for this module,
    // they are only present to be consistent across all modules.
    _filePath: string,
    _projectPath: string,
    outputLogger: vscode.OutputChannel,
    editor: vscode.TextEditor
): Promise<IssueObject[]> => {
    // This is literally only needed because too many
    // variable names are re-used
    const codeBody = editor.document.getText(codeRange);
    const startline = codeRange.start.line;

    return new Promise((resolve, reject) => {
        request.post(
            SERVER + MODEL,
            {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "Content-Type": "Application/json",
                    cookie: HARDCODE_COOKIE
                },
                json: {
                    username: HARDCODE_USERNAME,
                    code: codeBody
                }
            },
            (error, response, body) => {
                if (error) {
                    reject("Error making API request: " + error.message);
                    return;
                }
                if (response.statusCode !== 200) {
                    reject("Invalid response from server" + body);
                    return;
                }

                // If not error

                // Need to reformat what the server responded with to the array of
                //  IssueObjects that the rest of the program is looking for.
                const issues: IssueObject[] = [];
                for (let issue of body.issues) {
                    const issueObject: IssueObject = {
                        // need to add the start line back as we don't always start with the first line of the document
                        line: issue.line_number + startline,
                        title: issue.title,
                        body: "",
                        code: codeBody
                    };
                    
                    issues.push(issueObject);
                }
                
                resolve(issues);
            }
        );
    });
};