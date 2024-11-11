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
exports.handleIncomingMessage = handleIncomingMessage;
exports.sendMessageToWebview = sendMessageToWebview;
exports.getFilteredTableData = getFilteredTableData;
exports.getWorkspaceTables = getWorkspaceTables;
exports.tableExists = tableExists;
exports.isTablesLoaded = isTablesLoaded;
const vscode = __importStar(require("vscode"));
const laravel_local_sqlite_provider_1 = require("../providers/sqlite/laravel-local-sqlite-provider");
const file_picker_sqlite_provider_1 = require("../providers/sqlite/file-picker-sqlite-provider");
const config_file_provider_1 = require("../providers/config-file-provider");
const laravel_mysql_provider_1 = require("../providers/mysql/laravel-mysql-provider");
const pagination_1 = require("./pagination");
const laravel_postgres_provider_1 = require("../providers/postgres/laravel-postgres-provider");
const export_table_data_1 = require("./export-table-data"); // Import the new export function
const logging_service_1 = require("./logging-service");
const workspaceTables = [];
const providers = [
    laravel_local_sqlite_provider_1.LaravelLocalSqliteProvider,
    file_picker_sqlite_provider_1.FilePickerSqliteProvider,
    config_file_provider_1.ConfigFileProvider,
    laravel_mysql_provider_1.LaravelMysqlProvider,
    laravel_postgres_provider_1.LaravelPostgresProvider,
];
let database = null;
async function handleIncomingMessage(data, webviewView) {
    const command = data.type.substring(data.type.indexOf(':') + 1);
    const actions = {
        'request:get-user-preferences': async () => vscode.workspace.getConfiguration('Devdb'),
        'request:get-available-providers': async () => await getAvailableProviders(),
        'request:select-provider': async () => await selectProvider(data.value),
        'request:select-provider-option': async () => await selectProviderOption(data.value),
        'request:get-tables': async () => getTables(),
        'request:get-fresh-table-data': async () => await getFreshTableData(data.value),
        'request:get-refreshed-table-data': async () => await getFreshTableData(data.value),
        'request:load-table-into-current-tab': async () => await getFreshTableData(data.value),
        'request:get-filtered-table-data': async () => await getFilteredTableData(data.value),
        'request:get-data-for-tab-page': async () => await loadRowsForPage(data.value),
        'request:open-settings': async () => await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:damms005.devdb'),
        'request:export-table-data': async () => await (0, export_table_data_1.exportTableData)(data.value, database),
    };
    const action = actions[data.type];
    if (!action)
        return;
    const response = await action();
    if (response)
        reply(webviewView.webview, `response:${command}`, response);
    else
        acknowledge(webviewView.webview, `response:${command}`);
}
function reply(webview, command, response) {
    webview.postMessage({ type: command, value: response });
}
function sendMessageToWebview(webview, payload) {
    webview.postMessage(payload);
}
function acknowledge(webview, command) {
    webview.postMessage({ type: command });
}
/**
 * Returns a list of all providers that can be used in the current workspace.
 */
async function getAvailableProviders() {
    (0, logging_service_1.log)('Starting to get available providers...');
    const availableProviders = await Promise.all(providers.map(async (provider) => {
        (0, logging_service_1.log)(`Checking provider: ${provider.name}`);
        if (provider.boot)
            await provider.boot();
        try {
            const canBeUsed = await provider.canBeUsedInCurrentWorkspace();
            (0, logging_service_1.log)(`${provider.name} useable in workspace: ${canBeUsed ? 'yes' : 'no'}`);
            return canBeUsed ? provider : null;
        }
        catch (error) {
            (0, logging_service_1.log)(`error: ${provider.name} - ${String(error)}`);
            vscode.window.showErrorMessage(`Error resolving provider '${provider.name}': ${String(error)}`);
        }
    }));
    const filteredProviders = availableProviders.filter((provider) => provider);
    (0, logging_service_1.log)(`Available providers: ${filteredProviders.map(provider => provider.name).join(', ')}`);
    return filteredProviders
        .map((provider) => ({
        name: provider.name,
        type: provider.type,
        id: provider.id,
        description: provider.description,
        options: provider.cache?.map((cache) => ({
            id: cache.id,
            description: cache.description,
            details: cache.details,
        })),
    }));
}
async function selectProvider(providerId) {
    const provider = (providers.find((provider) => provider.id === providerId));
    if (!provider) {
        vscode.window.showErrorMessage(`Could not find provider with id ${providerId}`);
        return false;
    }
    database = await provider.getDatabaseEngine();
    if (!database) {
        vscode.window.showErrorMessage(`Provider selection error: Could not get database engine for ${providerId}`);
        return false;
    }
    return true;
}
async function selectProviderOption(option) {
    const provider = (providers.find((provider) => provider.id === option.provider));
    if (!provider) {
        vscode.window.showErrorMessage(`Could not find provider with id ${option}`);
        return false;
    }
    database = await provider.getDatabaseEngine(option);
    if (!database) {
        vscode.window.showErrorMessage(`Provider option error: Could not get database engine for ${option.provider}`);
        return false;
    }
    return true;
}
async function getFreshTableData(requestPayload) {
    return getTableData({
        table: requestPayload.table,
        itemsPerPage: requestPayload.itemsPerPage,
    });
}
async function getFilteredTableData(requestPayload) {
    const tableData = await getTableData({
        table: requestPayload.table,
        itemsPerPage: requestPayload.itemsPerPage,
        filters: requestPayload.filters,
    });
    if (!tableData)
        return;
    return {
        ...tableData,
        filters: requestPayload.filters,
    };
}
async function getTableData(requestPayload) {
    if (!database)
        return;
    const totalRows = (await database?.getTotalRows(requestPayload.table, requestPayload.filters)) || 0;
    const pagination = (0, pagination_1.getPaginationFor)(requestPayload.table, 1, totalRows, requestPayload.itemsPerPage);
    const limit = pagination.itemsPerPage;
    const offset = 0;
    const tableCreationSql = await database.getTableCreationSql(requestPayload.table);
    const columns = await database.getColumns(requestPayload.table);
    const queryResponse = await database.getRows(requestPayload.table, columns, limit, offset, requestPayload.filters);
    if (!queryResponse)
        return;
    return {
        table: requestPayload.table,
        tableCreationSql,
        lastQuery: queryResponse.sql,
        columns,
        rows: queryResponse.rows || [],
        totalRows,
        pagination,
    };
}
async function loadRowsForPage(requestPayload) {
    if (!database)
        return;
    const pagination = (0, pagination_1.getPaginationFor)(requestPayload.table, requestPayload.page, requestPayload.totalRows, requestPayload.itemsPerPage);
    const limit = pagination.itemsPerPage;
    const offset = (pagination.currentPage - 1) * limit;
    const rows = await database.getRows(requestPayload.table, requestPayload.columns, limit, offset, requestPayload.whereClause);
    return {
        table: requestPayload.table,
        lastQuery: rows?.sql,
        rows: rows?.rows || [],
        totalRows: requestPayload.totalRows,
        pagination,
    };
}
async function getTables() {
    const tables = await database?.getTables();
    if (tables) {
        workspaceTables.push(...tables);
    }
    return tables;
}
function getWorkspaceTables() {
    return workspaceTables;
}
function tableExists(tableName) {
    return workspaceTables.includes(tableName);
}
function isTablesLoaded() {
    return workspaceTables.length > 0;
}
//# sourceMappingURL=messenger.js.map