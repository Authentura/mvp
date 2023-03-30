import * as vscode from "vscode";
import * as request from "request";
import { parseBody } from "./response";

export function activate(context: vscode.ExtensionContext) {
  const outputLogger = vscode.window.createOutputChannel("authentura-mvp");
  context.subscriptions.push(outputLogger);
  outputLogger.show(true);
  outputLogger.appendLine("Initialised");

  const diagnostics = vscode.languages.createDiagnosticCollection(
    "authentura-mvp.vulnerability-diagnostics"
  );
  context.subscriptions.push(diagnostics);

  let scanCommand = vscode.commands.registerCommand(
    "authentura-mvp.scan",
    () => {
      // Dont do anything if there is no active editor
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      // Get the currnet text from the editor
      const document = editor.document;

      // Ignore plain text and untitled documents
      if (document.languageId === "plaintext" || document.isUntitled) {
        vscode.window.showInformationMessage(
          "Cannot check security of plain text or untitled windows."
        );
        return;
      }

      const code = document.getText();

      // Make the request to our server
      request.post(
        "http://localhost:3000/check/3",
        {
          headers: {
            "content-type": "application/json",
            cookie: "token=e0f25945-becd-4e8d-a372-278b90597fee",
          },
          json: {
            username: "admin",
            code: code,
          },
        },
        (error: { message: string }, _response, body: string) => {
          if (error) {
            vscode.window.showErrorMessage(
              "Error making API request: " + error.message
            );

            return;
          }

          let response = parseBody(body, outputLogger);

          if (response.issues) {
            const _diagnostics: vscode.Diagnostic[] = [];

            for (let [line, issueTupleList] of response.issues) {
              const lineText = editor.document.lineAt(line - 1).text;

              const lineStart = lineText.length - lineText.trimStart().length;
              const lineLength = lineText.length - 1;

              const range = new vscode.Range(
                line - 1,
                lineStart,
                line - 1,
                lineLength
              );

              for (let [issue, explanation] of issueTupleList) {
                const diagnostic = new vscode.Diagnostic(
                  range,
                  `${issue}\n\n${explanation}`,
                  vscode.DiagnosticSeverity.Information
                );

                outputLogger.appendLine(`${issue}\n\n${explanation}`);

                diagnostic.code = "authentura-mvp.vulnerability-diagnostics";
                _diagnostics.push(diagnostic);
              }
            }

            diagnostics.set(document.uri, _diagnostics);
          }
        }
      );
    }
  );

  context.subscriptions.push(scanCommand);

  let clearCommand = vscode.commands.registerCommand(
    "authentura-mvp.clear",
    () => {
      diagnostics.clear();
    }
  );

  context.subscriptions.push(clearCommand);
}

export function deactivate() {}
