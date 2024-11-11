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
exports.LaravelMysqlProvider = void 0;
const vscode = __importStar(require("vscode"));
const mysql_engine_1 = require("../../database-engines/mysql-engine");
const env_file_parser_1 = require("../../services/laravel/env-file-parser");
const logging_service_1 = require("../../services/logging-service");
exports.LaravelMysqlProvider = {
    name: 'Laravel Mysql (with Sail support)',
    type: 'mysql',
    id: 'laravel-mysql',
    description: 'Laravel MySQL with default .env config or Sail config in docker-compose.yml',
    engine: undefined,
    async canBeUsedInCurrentWorkspace() {
        (0, logging_service_1.log)('Checking if Laravel MySQL provider can be used in the current workspace...');
        const connection = await (0, env_file_parser_1.getConnectionInEnvFile)('mysql', 'mysql');
        (0, logging_service_1.log)(`Connection status: ${connection ? 'successful' : 'failed'}`);
        if (!connection)
            return false;
        try {
            (0, logging_service_1.log)('Creating MySQL engine...');
            this.engine = new mysql_engine_1.MysqlEngine(connection);
        }
        catch (error) {
            vscode.window.showErrorMessage(`MySQL connection error: ${String(error)}`);
            (0, logging_service_1.log)(`MySQL connection error: ${String(error)}`);
            return false;
        }
        (0, logging_service_1.log)('Laravel MySQL: OK');
        return (await this.engine.isOkay());
    },
    async getDatabaseEngine() {
        return this.engine;
    }
};
//# sourceMappingURL=laravel-mysql-provider.js.map