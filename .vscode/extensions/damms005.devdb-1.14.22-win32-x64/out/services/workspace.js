"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstWorkspacePath = getFirstWorkspacePath;
exports.getPathToWorkspaceFile = getPathToWorkspaceFile;
exports.getWorkspaceFileContent = getWorkspaceFileContent;
exports.fileExists = fileExists;
const fs_1 = require("fs");
const path_1 = require("path");
const vscode = __importStar(require("vscode"));
function getFirstWorkspacePath() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders)
        return undefined;
    return workspaceFolders[0].uri.fsPath;
}
/**
 * Returns the path to the workspace file.
 */
function getPathToWorkspaceFile(...subPath) {
    const firstWorkspacePath = getFirstWorkspacePath();
    if (!firstWorkspacePath)
        return undefined;
    return (0, path_1.join)(firstWorkspacePath, ...subPath);
}
function getWorkspaceFileContent(...subPath) {
    const filePath = getPathToWorkspaceFile(...subPath);
    if (!filePath)
        return undefined;
    if (!(0, fs_1.existsSync)(filePath))
        return undefined;
    return (0, fs_1.readFileSync)(filePath);
}
async function fileExists(path) {
    try {
        await vscode.workspace.fs.stat(vscode.Uri.file(path));
        return true;
    }
    catch (error) {
        return false;
    }
}
//# sourceMappingURL=workspace.js.map