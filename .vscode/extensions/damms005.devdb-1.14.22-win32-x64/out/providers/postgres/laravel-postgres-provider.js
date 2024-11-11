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
exports.LaravelPostgresProvider = void 0;
const vscode = __importStar(require("vscode"));
const postgres_engine_1 = require("../../database-engines/postgres-engine");
const env_file_parser_1 = require("../../services/laravel/env-file-parser");
exports.LaravelPostgresProvider = {
    name: 'Laravel Postgres',
    type: 'postgres',
    id: 'laravel-postgres',
    description: 'Laravel Postgres with default .env config',
    engine: undefined,
    async canBeUsedInCurrentWorkspace() {
        const connection = await (0, env_file_parser_1.getConnectionInEnvFile)('pgsql', 'postgres');
        if (!connection)
            return false;
        try {
            this.engine = new postgres_engine_1.PostgresEngine(connection);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Postgres connection error: ${String(error)}`);
            return false;
        }
        return (await this.engine.isOkay());
    },
    async getDatabaseEngine() {
        return this.engine;
    }
};
//# sourceMappingURL=laravel-postgres-provider.js.map