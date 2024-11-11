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
exports.getConnectionInEnvFile = getConnectionInEnvFile;
const vscode = __importStar(require("vscode"));
const laravel_core_1 = require("./laravel-core");
const sequelize_connector_1 = require("../sequelize-connector");
const sail_1 = require("./sail");
const logging_service_1 = require("../logging-service");
async function getConnectionInEnvFile(connection, dialect) {
    (0, logging_service_1.log)('Fetching connection details from .env file. Laravel connection: ', connection);
    const envConnection = await (0, laravel_core_1.getEnvFileValue)('DB_CONNECTION');
    const host = await getHost();
    const username = await (0, laravel_core_1.getEnvFileValue)('DB_USERNAME') || '';
    const password = await (0, laravel_core_1.getEnvFileValue)('DB_PASSWORD') || '';
    const database = await (0, laravel_core_1.getEnvFileValue)('DB_DATABASE');
    (0, logging_service_1.log)(`Laravel/${dialect} connection details: connection=${envConnection}, host=${host}, username=${username}, database=${database}`);
    if (connection !== envConnection) {
        (0, logging_service_1.log)(`Connection type mismatch: expected "${connection}", found "${envConnection}"`);
        return;
    }
    if (dialect !== 'mysql' && dialect !== 'postgres') {
        vscode.window.showErrorMessage(`No support for '${dialect}' in Laravel Sail yet`);
        (0, logging_service_1.log)(`Error connecting using host configured in .env file. Conn:`, connection);
        return;
    }
    let portOrConnection = await getSuccessfulConnectionOrPort(dialect, host, username, password);
    if (!database || !portOrConnection) {
        (0, logging_service_1.log)(`Missing database or port: database=${database}, port=${portOrConnection}`);
        return;
    }
    (0, logging_service_1.log)(`Laravel/${dialect} connection details:`, envConnection, host, portOrConnection, username, database);
    if (typeof portOrConnection === 'object') {
        return portOrConnection;
    }
    try {
        return await connectUsingHostConfiguredInEnvFile(dialect, host, portOrConnection, username, password, database);
    }
    catch (error) {
        return;
    }
}
async function connectUsingHostConfiguredInEnvFile(dialect, host, port, username, password, database) {
    return await (0, sequelize_connector_1.getConnectionFor)(dialect, host, port, username, password, database);
}
async function getHost() {
    const localhost = '127.0.0.1';
    const isALaravelSailWorkspace = await (0, sail_1.hasLaravelSailDockerComposeFile)();
    if (isALaravelSailWorkspace && vscode.env.remoteName != "dev-container") {
        return localhost;
    }
    return (await (0, laravel_core_1.getEnvFileValue)('DB_HOST')) || localhost;
}
/**
 * A user ran into a bug whereby Sails was configured i.e. FORWARD_DB_PORT was defined.
 * At same time, DB_PORT was defined. However, latter was actually used in project and
 * former was just an obsolete config dangling around. This broke DevDb because we were
 * connecting with Sails config first if found, then proceed with DB_PORT otherwise.
 * This change below ensures that we only prioritize Sails config if we able to connect to
 * it.
 */
async function getSuccessfulConnectionOrPort(dialect, host, username, password) {
    if (await (0, sail_1.hasLaravelSailDockerComposeFile)()) {
        const dockerPort = await (0, sail_1.getPortFromDockerCompose)(dialect);
        if (dockerPort) {
            if (await tryGetConnection(dialect, host, dockerPort, username, password)) {
                return (0, sail_1.getPortFromDockerCompose)(dialect);
            }
        }
    }
    return parseInt(await (0, laravel_core_1.getEnvFileValue)('DB_PORT') || '3306');
}
async function tryGetConnection(dialect, host, port, username, password) {
    return await (0, sequelize_connector_1.getConnectionFor)(dialect, host, port, username, password);
}
//# sourceMappingURL=env-file-parser.js.map