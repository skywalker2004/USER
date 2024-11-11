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
exports.FilePickerSqliteProvider = void 0;
const vscode = __importStar(require("vscode"));
const config_service_1 = require("../../services/config-service");
const sqlite_engine_1 = require("../../database-engines/sqlite-engine");
exports.FilePickerSqliteProvider = {
    name: 'SQLite Database File Picker',
    type: 'sqlite',
    id: 'file-picker-sqlite',
    description: 'SQLite database file from your computer',
    engine: undefined,
    async canBeUsedInCurrentWorkspace() {
        return true;
    },
    async getDatabaseEngine() {
        const filePath = await selectFile();
        if (!filePath) {
            vscode.window.showErrorMessage('No file selected.');
            return;
        }
        this.engine = new sqlite_engine_1.SqliteEngine(filePath);
        let isOkay = false;
        try {
            isOkay = (await this.engine.isOkay());
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error opening ${filePath}: ${String(error)}`);
            return;
        }
        if (!isOkay) {
            vscode.window.showErrorMessage('The selected file is not a valid SQLite database.');
            return;
        }
        await (0, config_service_1.addSqlDatabaseToConfig)(filePath);
        return this.engine;
    }
};
async function selectFile() {
    const fileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        openLabel: 'Open SQLite File',
        canSelectFolders: false,
        title: 'Select SQLite File',
        filters: { 'SQLite': ['sqlite', 'db'], 'All Files': ['*'] }
    });
    if (fileUri && fileUri[0]) {
        return fileUri[0].fsPath;
    }
}
//# sourceMappingURL=file-picker-sqlite-provider.js.map