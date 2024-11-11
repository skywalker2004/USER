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
exports.DEVDB_CONFIG_FILE_NAME = void 0;
exports.getConfigFileContent = getConfigFileContent;
exports.addSqlDatabaseToConfig = addSqlDatabaseToConfig;
const vscode = __importStar(require("vscode"));
const workspace_1 = require("./workspace");
const cosmiconfig_1 = require("cosmiconfig");
exports.DEVDB_CONFIG_FILE_NAME = '.devdbrc';
function getConfigFilePath() {
    return (0, workspace_1.getPathToWorkspaceFile)(exports.DEVDB_CONFIG_FILE_NAME);
}
async function getConfigFileContent() {
    const configFilePath = getConfigFilePath();
    if (!configFilePath)
        return;
    try {
        const result = await (0, cosmiconfig_1.cosmiconfig)('devdb').load(configFilePath);
        if (!result)
            return;
        return result.config;
    }
    catch (error) {
    }
}
/**
 * Adds a SQLite database to the config file if it doesn't already exist
 */
async function addSqlDatabaseToConfig(sqliteFilePath) {
    if (!sqliteFilePath)
        return;
    const config = await getConfigFileContent() || [];
    const configExists = config.some(config => config.type === 'sqlite' && config.path === sqliteFilePath);
    if (configExists)
        return;
    config.push({
        type: 'sqlite',
        path: sqliteFilePath
    });
    await vscode.workspace.fs.writeFile(vscode.Uri.file(getConfigFilePath()), Buffer.from(JSON.stringify(config, null, 2)));
}
//# sourceMappingURL=config-service.js.map