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
exports.LaravelLocalSqliteProvider = void 0;
const vscode = __importStar(require("vscode"));
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const sqlite_engine_1 = require("../../database-engines/sqlite-engine");
const workspace_1 = require("../../services/workspace");
exports.LaravelLocalSqliteProvider = {
    name: 'Laravel Local SQLite (default)',
    type: 'sqlite',
    id: 'laravel-local-sqlite',
    description: 'Laravel with local default SQLite database',
    engine: undefined,
    async canBeUsedInCurrentWorkspace() {
        const configContent = (0, workspace_1.getWorkspaceFileContent)('config', 'database.php');
        if (!configContent)
            return false;
        const envFileContents = (0, workspace_1.getWorkspaceFileContent)('.env');
        if (!envFileContents)
            return false;
        const env = (0, dotenv_1.parse)(envFileContents);
        const usesSqlite = env.DB_CONNECTION == 'sqlite';
        if (!usesSqlite)
            return false;
        const sqliteFilePath = await getSqliteFilePath(configContent.toString(), env);
        try {
            this.engine = new sqlite_engine_1.SqliteEngine(sqliteFilePath);
        }
        catch (error) {
            vscode.window.showErrorMessage(`SQLite file error ${sqliteFilePath}: ${String(error)}`);
            return false;
        }
        return (await this.engine.isOkay());
    },
    async getDatabaseEngine() {
        return this.engine;
    }
};
async function getSqliteFilePath(configContent, envFileContent) {
    // Match /env('DB_DATABASE', database_path('database.sqlite'))/ irrespective of whitespace
    const databasePathRegex = /env\(\s*['"]DB_DATABASE['"]\s*,\s*database_path\(\s*['"]database\.sqlite['"]\s*\)\s*\)/;
    if (!databasePathRegex.test(configContent))
        return '';
    const databasePathDefinedInEnv = envFileContent.DB_DATABASE;
    if (databasePathDefinedInEnv)
        return databasePathDefinedInEnv;
    const workspacePath = (0, workspace_1.getFirstWorkspacePath)();
    if (!workspacePath)
        return '';
    const databaseFilePath = (0, path_1.join)(workspacePath, 'database', 'database.sqlite');
    const exists = await (0, workspace_1.fileExists)(databaseFilePath);
    if (!exists)
        return '';
    return databaseFilePath;
}
//# sourceMappingURL=laravel-local-sqlite-provider.js.map