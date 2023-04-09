/* eslint-disable @typescript-eslint/naming-convention */
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

  let ignoreDiagnosticCommand = vscode.commands.registerCommand(
    "authentura-mvp.ignoreDiagnostic",
    ({
      uri,
      diagnostic,
    }: {
      uri: vscode.Uri;
      diagnostic: vscode.Diagnostic;
    }) => {
      let _diagnostics = diagnostics.get(uri);

      if (!_diagnostics) {
        return;
      }

      _diagnostics = _diagnostics.filter((value) => value !== diagnostic);
      diagnostics.set(uri, _diagnostics);
    }
  );

  context.subscriptions.push(
    ignoreDiagnosticCommand,
  );

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

      // change to text-davinci-3 for the old response with strings
      // or if you don't have access to the fine-tuned model.
      //const model = "davinci:ft-personal-2023-04-08-13-10-24";
      const model = "curie:ft-personal-2023-04-08-19-01-16";
      //const model = "text-davinci-003";


      request.post(
        "http://localhost:3000/check/"+model,
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
        (error: { message: string }, _response, body) => { // body is only a string if we error
          if (error) {
            vscode.window.showErrorMessage(
              "Error making API request: " + error.message
            );

            return;
          }
          if (_response.statusCode !== 200) {
            vscode.window.showErrorMessage(
              "Invalid response from server"
            );

          }
          
          const issues: Array<any> = body.issues;
          
          const _diagnostics: vscode.Diagnostic[] = [];
          for (let issue of issues) {
            const lineText = editor.document.lineAt(issue.line_number -1).text;
            const lineStart = lineText.length - lineText.trimStart().length;
            const lineLength = lineText.length - 1;

            const range = new vscode.Range(
              issue.line_number - 1,
              lineStart,
              issue.line_number - 1,
              lineLength
            );

            const diagnostic = new vscode.Diagnostic(
              range,
              `${issue.title}\n\n${issue.body}`,
              vscode.DiagnosticSeverity.Information
            );

            diagnostic.source = issue;
            diagnostic.code = "authentura-mvp.vulnerability-diagnostic";


            _diagnostics.push(diagnostic);
          
          }
          diagnostics.set(document.uri, _diagnostics);

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

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: "file" },
      new VulnerabilityActionsProvider()
    )
  );
}

export function deactivate() {}

export class VulnerabilityActionsProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    const diagnostics = context.diagnostics.filter(
      (item) => item.code === "authentura-mvp.vulnerability-diagnostic"
    );

    if (diagnostics.length === 0) {
      return undefined;
    }

    const actions = [];

    for (let diagnostic of diagnostics) {
      const temporaryIgnoreTitle = `Ignore "${diagnostic.source}" on line ${
        diagnostic.range.start.line + 1
      } for this file`;
      const permanentlyIgnoreTitle = `Permanently ignore "${
        diagnostic.source
      }" on line ${diagnostic.range.start.line + 1} for this file`;

      const temporaryIgnore: vscode.CodeAction = {
        title: temporaryIgnoreTitle,
        kind: vscode.CodeActionKind.Empty,
        diagnostics: [diagnostic],
        isPreferred: true,
        command: {
          title: temporaryIgnoreTitle,
          command: "authentura-mvp.ignoreDiagnostic",
          arguments: [{ uri: document.uri, diagnostic }],
        },
      };

      const permanentIgnore: vscode.CodeAction = {
        title: permanentlyIgnoreTitle,
        kind: vscode.CodeActionKind.Empty,
        diagnostics: [diagnostic],
        isPreferred: true,
        command: {
          title: permanentlyIgnoreTitle,
          command: "authentura-mvp.permanentIgnoreDiagnostic",
          arguments: [{ uri: document.uri, diagnostic }],
        },
      };

      actions.push(temporaryIgnore, permanentIgnore);
    }

    return actions;
  }
}
