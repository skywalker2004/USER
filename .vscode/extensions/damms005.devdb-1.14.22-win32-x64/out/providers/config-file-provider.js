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
exports.ConfigFileProvider = void 0;
const vscode = __importStar(require("vscode"));
const sqlite_engine_1 = require("../database-engines/sqlite-engine");
const config_service_1 = require("../services/config-service");
const string_1 = require("../services/string");
const mysql_engine_1 = require("../database-engines/mysql-engine");
const sequelize_connector_1 = require("../services/sequelize-connector");
const postgres_engine_1 = require("../database-engines/postgres-engine");
const mssql_engine_1 = require("../database-engines/mssql-engine");
const fs_1 = require("fs");
exports.ConfigFileProvider = {
    name: 'Config File',
    type: 'sqlite',
    id: 'config-file-provider',
    description: 'Databases defined in your config file',
    engine: undefined,
    cache: undefined,
    async boot() {
        this.cache = undefined;
        this.engine = undefined;
    },
    async canBeUsedInCurrentWorkspace() {
        const configContent = await (0, config_service_1.getConfigFileContent)();
        if (!configContent)
            return false;
        if (!configContent.length)
            return false;
        if (!this.cache)
            this.cache = [];
        for (const config of configContent) {
            if (config.type === 'sqlite') {
                const connection = await sqliteConfigResolver(config);
                if (connection)
                    this.cache.push(connection);
            }
            if (config.type === 'mysql' || config.type === 'mariadb') {
                if (!config.name) {
                    const db = config.type === 'mysql' ? 'MySQL' : 'MariaDB';
                    await vscode.window.showErrorMessage(`The ${db} config file entry ${config.name || ''} does not have a name.`);
                    return false;
                }
                const connection = await mysqlConfigResolver(config);
                if (connection)
                    this.cache.push(connection);
            }
            if (config.type === 'postgres') {
                if (!config.name) {
                    await vscode.window.showErrorMessage(`The Postgres config file entry ${config.name || ''} does not have a name.`);
                    return false;
                }
                const connection = await postgresConfigResolver(config);
                if (connection)
                    this.cache.push(connection);
            }
            if (config.type === 'mssql') {
                if (!config.name) {
                    await vscode.window.showErrorMessage(`The MSSQL config file entry ${config.name || ''} does not have a name.`);
                    return false;
                }
                const connection = await mssqlConfigResolver(config);
                if (connection)
                    this.cache.push(connection);
            }
        }
        return this.cache.length > 0;
    },
    async getDatabaseEngine(option) {
        if (option) {
            const matchedOption = this.cache?.find((cache) => cache.id === option.option.id);
            if (!matchedOption) {
                await vscode.window.showErrorMessage(`Could not find option with id ${option.option.id}`);
                return;
            }
            this.engine = matchedOption.engine;
        }
        return this.engine;
    }
};
async function mssqlConfigResolver(mssqlConfig) {
    const connection = await (0, sequelize_connector_1.getConnectionFor)('mssql', mssqlConfig.host, mssqlConfig.port, mssqlConfig.username, mssqlConfig.password, mssqlConfig.database);
    if (!connection)
        return;
    const engine = new mssql_engine_1.MssqlEngine(connection);
    const isOkay = (await engine.isOkay());
    if (!isOkay || !engine.sequelize) {
        await vscode.window.showErrorMessage(`The MSSQL connection ${mssqlConfig.name || ''} specified in your config file is not valid.`);
        return;
    }
    return {
        id: mssqlConfig.name,
        description: mssqlConfig.name,
        engine: engine
    };
}
async function sqliteConfigResolver(sqliteConnection) {
    if (!(0, fs_1.existsSync)(sqliteConnection.path)) {
        vscode.window.showErrorMessage(`A path to an SQLite database file specified in your config file is not valid: ${sqliteConnection.path}`);
        return Promise.resolve(undefined);
    }
    const engine = new sqlite_engine_1.SqliteEngine(sqliteConnection.path);
    const isOkay = (await engine.isOkay());
    if (!isOkay || !engine.sequelize) {
        await vscode.window.showErrorMessage('The SQLite database specified in your config file is not valid.');
        return;
    }
    else {
        return {
            id: sqliteConnection.path,
            details: sqliteConnection.path,
            description: (0, string_1.brief)(sqliteConnection.path),
            engine: engine
        };
    }
}
async function mysqlConfigResolver(mysqlConfig) {
    const connection = await (0, sequelize_connector_1.getConnectionFor)('mysql', mysqlConfig.host, mysqlConfig.port, mysqlConfig.username, mysqlConfig.password, mysqlConfig.database);
    if (!connection)
        return;
    const engine = new mysql_engine_1.MysqlEngine(connection);
    const isOkay = (await engine.isOkay());
    if (!isOkay || !engine.sequelize) {
        await vscode.window.showErrorMessage(`The MySQL connection ${mysqlConfig.name || ''} specified in your config file is not valid.`);
        return;
    }
    return {
        id: mysqlConfig.name,
        description: mysqlConfig.name,
        engine: engine
    };
}
async function postgresConfigResolver(postgresConfig) {
    const connection = await (0, sequelize_connector_1.getConnectionFor)('postgres', postgresConfig.host, postgresConfig.port, postgresConfig.username, postgresConfig.password, postgresConfig.database);
    if (!connection)
        return;
    const engine = new postgres_engine_1.PostgresEngine(connection);
    const isOkay = (await engine.isOkay());
    if (!isOkay || !engine.sequelize) {
        await vscode.window.showErrorMessage(`The Postgres connection ${postgresConfig.name || ''} specified in your config file is not valid.`);
        return;
    }
    return {
        id: postgresConfig.name,
        description: postgresConfig.name,
        engine: engine
    };
}
//# sourceMappingURL=config-file-provider.js.map