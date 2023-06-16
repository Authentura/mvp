import * as vscode from "vscode";
import * as request from "request";
import {Line, Issue, Explanation, IssueMap, IssueObject } from "../types";
import { resolve } from "path";


// For now we are using the base gpt3 model to
// get the explenations. We might want to change
// this to a fine-tuned model depending on the
// cost and accuracy.
//const MODEL = 'text-davinci-003';
const MODEL = 'gpt-3.5-turbo-16k';
//const SERVER = "https://mvp.authentura.co.uk/explain/";
const SERVER = "http://localhost:3000/explain/";



export const run = (
    issue: IssueObject,
    outputLogger: vscode.OutputChannel,
    editor: vscode.TextEditor
): Promise<IssueObject> => {

    return new Promise((resolve, reject) => {

        // Get the username and the token from configuration
        const configuration = vscode.workspace.getConfiguration('authenguard');
        const settingsUsername: string = configuration.get('username') || "";
        const settingsToken: string = configuration.get('token') || "";
        if (settingsUsername === "" || settingsToken === "") {
            reject("Username or access token not set in settings!");
            return;
        }
        
        
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
                    code: issue.code,
                    title: issue.title,
                    line: issue.range.start.line
                }
                
            },
            (error, response, body) => {
                if (error) {
                    reject("Error making API request: " + error.message);
                    return;
                }
                
                if (response.statusCode !== 200) {
                    reject("Invalid response from server: " + body);
                    return;
                }
                
                if (body === null) {
                    reject("Error: Server responded with an empty message");
                    return;
                }

                if (!body.vulnerable) {
                    issue.body = "Our appologies, this is likely not a vulnerability.", // TODO: add a report me
                    issue.rejected = true;
                    resolve(issue);
                }
                
                issue.body = body.explanation;
                resolve(issue);
            }
        );
    });
};
