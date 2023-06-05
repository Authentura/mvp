import * as vscode from "vscode";
import { exec } from 'child_process';
import { getCodeAroundCursor } from "../tokens";
import {Line, Issue, Explanation, IssueMap, IssueObject } from "../types";
import { stderr, stdout } from "process";


let errorShown = false;
function showErrorOnce() {
    if (!errorShown){
        vscode.window.showInformationMessage("Python performance of Authenguard can be improved by installing bandit.\n`pip install bandit`");
        errorShown = true;
    }
}


export const run = (
    filePath: string,
    outputLogger: vscode.OutputChannel,
    editor: vscode.TextEditor
): Promise<IssueObject[]> => {
    

    return new Promise((resolve, reject) => {
        
        exec(`bandit --version`, (error, stdout, stderr) => {
            // This is used to check if bandit is installed.
            // TODO: make sure this is more user-friendly and not just random errors on the users screen
            if (error) {
                // At the current moment, there is no user friendly way of getting bandit installed,
                // for this reason id rather not show error messages if it is not installed as it could
                // annoy the user.
                // Instead we'll suggest for the user that they could install bandit, but only once
                showErrorOnce();
                reject("The python scanning module (bandit) is not installed on your system!")
                return;
            }
        });

        
        exec(`bandit -f json ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                // TODO: for some reason bandit will output a 1 even if the command ran well.
                //        as far as I can see it will output a 1 if there are vulnerabilities
                //        in the scanned code. Unfortunately this triggers the error cause,
                //        so we need to find a better way to error check this later.
                //        This is also the reason why the bandit --version command is used
                //        to check whether its installed.
            }

            const outputJson = JSON.parse(stdout);
            
            const issues: IssueObject[] = [];
            for(let result of outputJson.results) {
                // Bandit outputs a lot of things on low and *most* of them
                // are truly useless. We can sacrifice the few good low vulnerabilities
                // so the user isn't constantly bombarded with shit.
                if (result.issue_severity === "LOW") {
                    continue;
                }
                
                // We can safely ignore things that we aren't confident in (I think)
                // Might have to revise this decision
                if (result.issue_confidence === "LOW"){
                    continue;
                }


                // Get the highlight range for the issue
                const lineNum = result.line_number -1;
                const lineText = editor.document.lineAt(lineNum).text;
                const range = new vscode.Range(
                    lineNum-1,
                    lineText.length - lineText.trimStart().length,
                    lineNum,
                    lineText.length
                );

                
                // Get 500 tokens from above and below the issue so gpt-explain can have some
                // code context to explain the issuew ith.
                const codeRangeForExplanation = getCodeAroundCursor(new vscode.Position(result.line_number, 0), 500)
                const codeBody = editor.document.getText(codeRangeForExplanation);
                
                const issue: IssueObject = {
                    range: range,
                    title: result.issue_text,
                    body: "",
                    code: codeBody,
                    rejected: false
                };
                issues.push(issue);
            }

            resolve(issues);
        });
    });
}


// standard output of bandit:
//
// [main]  INFO    profile include tests: None
// [main]  INFO    profile exclude tests: None
// [main]  INFO    cli include tests: None
// [main]  INFO    cli exclude tests: None
// {
//   "errors": [],
//   "generated_at": "2023-06-02T08:13:53Z",
//   "metrics": {
//     "./main.py": {
//       "CONFIDENCE.HIGH": 0,
//       "CONFIDENCE.LOW": 1,
//       "CONFIDENCE.MEDIUM": 0,
//       "CONFIDENCE.UNDEFINED": 0,
//       "SEVERITY.HIGH": 0,
//       "SEVERITY.LOW": 0,
//       "SEVERITY.MEDIUM": 1,
//       "SEVERITY.UNDEFINED": 0,
//       "loc": 23,
//       "nosec": 0,
//       "skipped_tests": 0
//     },
//     "_totals": {
//       "CONFIDENCE.HIGH": 0,
//       "CONFIDENCE.LOW": 1,
//       "CONFIDENCE.MEDIUM": 0,
//       "CONFIDENCE.UNDEFINED": 0,
//       "SEVERITY.HIGH": 0,
//       "SEVERITY.LOW": 0,
//       "SEVERITY.MEDIUM": 1,
//       "SEVERITY.UNDEFINED": 0,
//       "loc": 23,
//       "nosec": 0,
//       "skipped_tests": 0
//     }
//   },
//   "results": [
//     {
//       "code": "11         cursor = conn.cursor()\n12         query = f'SELECT * FROM users WHERE username=\\'{username}\\''\n13         cursor.execute(query)\n",
//       "col_offset": 16,
//       "end_col_offset": 68,
//       "filename": "./main.py",
//       "issue_confidence": "LOW",
//       "issue_cwe": {
//         "id": 89,
//         "link": "https://cwe.mitre.org/data/definitions/89.html"
//       },
//       "issue_severity": "MEDIUM",
//       "issue_text": "Possible SQL injection vector through string-based query construction.",
//       "line_number": 12,
//       "line_range": [
//         12
//       ],
//       "more_info": "https://bandit.readthedocs.io/en/1.7.5/plugins/b608_hardcoded_sql_expressions.html",
//       "test_id": "B608",
//       "test_name": "hardcoded_sql_expressions"
//     }
//   ]
// }
//https://chat.openai.com/share/9a86a2c2-ae57-44be-acec-c8de96be8bf2