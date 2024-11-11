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
exports.exportTableData = exportTableData;
const vscode = __importStar(require("vscode"));
const messenger_1 = require("./messenger");
const sql_formatter_1 = require("sql-formatter");
async function exportTableData(payload, database) {
    if (!database) {
        vscode.window.showErrorMessage('No database selected');
        return;
    }
    ;
    let tableData = await (0, messenger_1.getFilteredTableData)(payload);
    if (!tableData)
        return [];
    try {
        if (payload.exportTo === 'file') {
            await exportToFile(tableData.rows, payload.exportType, payload.table);
        }
        else if (payload.exportTo === 'clipboard') {
            await copyToClipboard(tableData.rows, payload.exportType, payload.table);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error exporting data to file: ${String(error)}`);
    }
}
async function exportToFile(data, exportType, table) {
    const filters = {
        'All Files': ['*']
    };
    switch (exportType) {
        case 'json':
            filters['JSON Files'] = ['json'];
            break;
        default:
            filters['SQL Files'] = ['sql'];
            break;
    }
    const fileUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.parse(`${table}.${exportType}`),
        filters,
    });
    if (!fileUri) {
        return;
    }
    let fileContent;
    switch (exportType) {
        case 'json':
            fileContent = JSON.stringify(data, null, 2);
            break;
        case 'sql':
            fileContent = generateSQLInsertStatements(data, table);
            break;
        default:
            vscode.window.showErrorMessage('Unsupported file type');
            return;
    }
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileContent, 'utf-8'));
    vscode.window.showInformationMessage(`Data exported to ${fileUri.fsPath}`);
}
async function copyToClipboard(data, exportType, table) {
    let fileContent = JSON.stringify(data, null, 2);
    switch (exportType) {
        case 'sql':
            fileContent = generateSQLInsertStatements(data, table);
            break;
    }
    await vscode.env.clipboard.writeText(fileContent);
    vscode.window.showInformationMessage('Data copied to clipboard');
}
function generateSQLInsertStatements(data, table) {
    if (!data.length)
        return '';
    const keys = Object.keys(data[0]);
    const sqlStatements = data.map(row => {
        const values = keys.map(key => escapeSql(row[key])).join(', ');
        return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values});`;
    });
    const query = sqlStatements.join('\n');
    try {
        return (0, sql_formatter_1.formatDialect)(query, {
            dialect: sql_formatter_1.sql,
            keywordCase: 'upper',
        });
    }
    catch (error) {
        vscode.window.showErrorMessage('Query could not be formatted');
        return query;
    }
}
function escapeSql(value) {
    if (!value)
        return 'NULL';
    const safelyStringableTypes = [
        'string',
        'object', // e.g. Date
    ];
    if (safelyStringableTypes.indexOf(typeof value) === -1) {
        return value;
    }
    ;
    value = String(value)
        .replace(/'/g, "''")
        .replace(/\n/g, '\\n');
    return `'${value}'`;
}
//# sourceMappingURL=export-table-data.js.map