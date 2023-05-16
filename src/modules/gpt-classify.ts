import * as vscode from "vscode";
import { promisify } from 'util';
import * as request from "request";
import {Line, Issue, Explanation, IssueMap, IssueObject } from "../types";
import { isSubdirectory } from "@vscode/test-electron/out/util";
import { start } from "repl";


const MODEL = 'curie:ft-personal-2023-04-12-13-08-55';
const SERVER = "https://mvp.authentura.co.uk/classify/";
//const SERVER = "http://localhost:3000/classify/";


export const run = (
    // The code that we want to scan
    codeRange: vscode.Range,
    outputLogger: vscode.OutputChannel,
    editor: vscode.TextEditor
): Promise<IssueObject[]> => {
    const codeBody = editor.document.getText(codeRange);
    const startLine = codeRange.start.line;
    
    return new Promise((resolve, reject) => {

        // Get the username and the token from configuration
        const configuration = vscode.workspace.getConfiguration('authenturaMvp');
        const settingsUsername: string = configuration.get('username') || "";
        const settingsToken: string = configuration.get('token') || "";
        if (settingsUsername === "" || settingsToken === "") {
            reject("Username or access token not set in settings!");
            return;
        }
        

        // Make a request to the classify endpoint
        request.post(
            SERVER + MODEL,
            {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "Content-Type": "Application/json",
                    cookie: `token=${settingsToken}`
                },
                json: {
                    username: settingsUsername,
                    code: codeBody
                }
            },
            (error, response, body) => {
                if (error) {
                    reject("EWrror making API request: " + error.message);
                    return;
                }
                
                if (response.statusCode !== 200) {
                    reject("Invalid response from server: " + body);
                    return;
                }
                


                const issues: IssueObject[] = [];
                for(let issue of body.issues)
                {
                    // If the request succeeded, turn the server json into an IssueObject
                    // Calculate the range for vscode
                    let lineNumber = editor.document.lineAt(issue.line_number+startLine).lineNumber;
                    let lineText = editor.document.lineAt(lineNumber).text;
                    
                    // GPT can sometimes mess up which line it actually means. We need to make
                    // sure that the line it gives is both valid and not empty
                    if (!lineText) {
                        reject("The server responded with an invalid line number!");
                    }
                    let i = 0;
                    // If the line gpt gives is basically empty, then try a couple lines above it
                    while (lineText.length -1 < 2) {
                        i ++;
                        lineNumber = lineNumber -i;
                        lineText = editor.document.lineAt(lineNumber-i).text;
                        if (i > 3) {
                            reject(`Server responded with a line that could not be handled. (Line: ${lineNumber})`);
                            
                        }
                    }
                    
                    const range = new vscode.Range(
                        lineNumber -2, // just make sure that we highlight a couple lines above and below what we intend
                        lineText.length - lineText.trimStart().length,
                        lineNumber,
                        lineText.length
                    );
                    
                    const issueObject: IssueObject = {
                        range: range,
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