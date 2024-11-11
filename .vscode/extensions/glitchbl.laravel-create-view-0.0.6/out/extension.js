"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const mkdirp = require("mkdirp");
const path = require("path");
const fs = require("fs");
const actionProvider_1 = require("./providers/actionProvider");
function createView(view) {
    if (Array.isArray(vscode.workspace.workspaceFolders) && vscode.workspace.workspaceFolders.length > 0) {
        let view_explode = view.split('.');
        let directory_path = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'resources/views', view_explode.splice(0, view_explode.length - 1).join('/'));
        let filename = `${view_explode.pop()}.blade.php`;
        let full_path = path.join(directory_path, filename);
        if (fs.existsSync(full_path)) {
            vscode.window.showWarningMessage('View already exists.');
        }
        else {
            mkdirp(directory_path, (err) => {
                if (err)
                    vscode.window.showErrorMessage(`Can't create directory ${directory_path}.`);
                fs.writeFileSync(full_path, '', 'utf8');
                vscode.window.showInformationMessage('View created.');
                let file = vscode.Uri.file(full_path);
                vscode.workspace.openTextDocument(file).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            });
        }
    }
    else {
        vscode.window.showErrorMessage('No workspace avaible.');
    }
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.createView', view_name => {
        if (view_name) {
            createView(view_name);
        }
        else {
            vscode.window.showInputBox().then(_value => {
                let value = String(_value);
                if (/^[_a-z0-9]+(\.[_a-z0-9]+)*$/.test(value)) {
                    createView(value);
                }
                else {
                    vscode.window.showErrorMessage("View path not valid.");
                }
            });
        }
    });
    let action = vscode.languages.registerCodeActionsProvider(['php', 'blade'], new actionProvider_1.default);
    context.subscriptions.push(disposable, action);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map