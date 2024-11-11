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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaravelCodelensService = void 0;
const vscode = __importStar(require("vscode"));
const pluralize_1 = __importDefault(require("pluralize"));
const messenger_1 = require("../../messenger");
const case_1 = __importDefault(require("case"));
exports.LaravelCodelensService = {
    /**
     * Returns a CodeLens for the Eloquent model class definition in the
     * given document. The CodeLens provides opening the table in DevDb.
     */
    async getCodelensFor(document) {
        const isNotPhpFile = document.languageId !== 'php';
        const isNotAppModelsNamespace = document.fileName.indexOf('app/Models') === -1;
        if (isNotPhpFile || isNotAppModelsNamespace) {
            return Promise.resolve(undefined);
        }
        const text = document.getText();
        const tables = (0, messenger_1.getWorkspaceTables)();
        if (tables.length === 0) {
            const command = {
                title: `Please connect to a database for Eloquent Codelens`,
                tooltip: `Eloquent Model Codelens requires database connection`,
                command: "",
            };
            const classNameDefinitionRegex = new RegExp(`class\\s+\\b[aA-zZ_]+\\b`);
            let matches = classNameDefinitionRegex.exec(text);
            if (!matches) {
                return Promise.resolve(undefined);
            }
            const line = document.lineAt(document.positionAt(matches.index).line);
            const indexOf = line.text.indexOf(matches[0]);
            const position = new vscode.Position(line.lineNumber, indexOf);
            const range = document.getWordRangeAtPosition(position, new RegExp(classNameDefinitionRegex));
            if (range) {
                return Promise.resolve(new vscode.CodeLens(range, command));
            }
        }
        const tableModelMap = await getTableModelMapForCurrentWorkspace();
        const filePath = document.fileName;
        for (const [model, entry] of Object.entries(tableModelMap)) {
            if (filePath !== entry.filePath)
                continue;
            const classNameDefinitionRegex = new RegExp(`class\\s+\\b${model}\\b`);
            let matches = classNameDefinitionRegex.exec(text);
            if (!matches) {
                return Promise.resolve(undefined);
            }
            const line = document.lineAt(document.positionAt(matches.index).line);
            const indexOf = line.text.indexOf(matches[0]);
            const position = new vscode.Position(line.lineNumber, indexOf);
            const range = document.getWordRangeAtPosition(position, new RegExp(classNameDefinitionRegex));
            if (range) {
                const command = {
                    title: "View table",
                    tooltip: `Open ${entry.table} table`,
                    command: "devdb.codelens.open-laravel-model-table",
                    arguments: [entry.table]
                };
                return Promise.resolve(new vscode.CodeLens(range, command));
            }
        }
    }
};
/**
 * It uses heuristics based on Laravel conventions to get Laravel
 * models in current workspace and their tables.
 * Returns an object: {table => model}
 */
async function getTableModelMapForCurrentWorkspace() {
    const modelFiles = await vscode.workspace.findFiles('app/Models/*.php', null, 1000);
    const modelTableMap = {};
    for (const file of modelFiles) {
        const fileName = file.fsPath.split('/').pop();
        if (!fileName)
            continue;
        const modelName = fileName.replace('.php', '');
        const table = await getTable(file.fsPath, modelName);
        modelTableMap[modelName] = {
            filePath: file.fsPath,
            table
        };
    }
    return modelTableMap;
}
async function getTable(fsPath, modelName) {
    const fileContent = (await vscode.workspace.fs.readFile(vscode.Uri.file(fsPath))).toString();
    const tablePropertyDefinition = /protected\s+\$table\s*=\s*['"](.+?)['"]/;
    const matches = fileContent.match(tablePropertyDefinition);
    if (matches) {
        return matches[1];
    }
    const modelSnakeCase = case_1.default.snake(modelName);
    return (0, pluralize_1.default)(modelSnakeCase);
}
//# sourceMappingURL=laravel-codelens-service.js.map