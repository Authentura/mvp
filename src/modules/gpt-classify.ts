import * as vscode from "vscode";
import * as request from "request";

const MODEL = 'curie:ft-personal-2023-04-12-13-08-55';
// all of these will have to change eventually
const SERVER = "http://localhost:3000/check/";
const HARDCODE_COOKIE = "token=e0f25945-becd-4e8d-a372-278b90597fee";
const HARDCODE_USERNAME = "admin";

export type Line = number;
export type Issue = string;
export type Explanation = string;

type IssueMap = Map<Line, [Issue, Explanation]>;

export interface Response {
    issues?: IssueMap;
}


export const run = (
    body: string,
    // These two arguments are not needed for this module,
    // they are only present to be consistent across all modules.
    _filePath: string,
    _projectPath: string,
    outputLogger: vscode.OutputChannel
): IssueMap | null => {
    
    // Make a request to our proxy server for openai
    request.post(
        SERVER+MODEL, // url
        {
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "Content-Type": "Application/json",
                cookie: HARDCODE_COOKIE
            },
            json: {
                username: HARDCODE_USERNAME,
                code: body
            }
        },
        (error: { message: string }, response, body) => {
            // Catch errors
            if (error) {
                vscode.window.showErrorMessage(
                    "Error making API request: " + error.message
                );
            }
            if (response.statusCode !== 200) {
                vscode.window.showErrorMessage(
                    "Invalid response from server"
                );
            }
            
            // If not error
            
           
            // need to re-format the array of issues from the server
            // to the IssueMap used in this module
            const issues: Array<any> = body.issues;
            for (let issue of issues) {
                // TODO: finish
            }

        }
    );

    


    // Create a sample issue just so this works for now
    const sampleIssueMap: IssueMap = new Map<Line, [Issue, Explanation]>();
    sampleIssueMap.set(5, [
        "Cross site scripting vulnerability",
        "This code is utter shit"
    ]);
    return sampleIssueMap;
};