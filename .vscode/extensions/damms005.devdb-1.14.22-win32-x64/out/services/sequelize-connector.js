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
exports.getConnectionFor = getConnectionFor;
const vscode = __importStar(require("vscode"));
const sequelize_1 = require("sequelize");
const logging_service_1 = require("./logging-service");
async function getConnectionFor(dialect, host, port, username, password, database = undefined) {
    (0, logging_service_1.log)(`Attempting to connect to database: dialect=${dialect}, host=${host}, port=${port}, username=${username}, database=${database}`);
    try {
        const sequelize = new sequelize_1.Sequelize({
            dialect,
            host: host ? String(host) : host,
            port: port ? Number(port) : port,
            username: username ? String(username) : username,
            password: password ? String(password) : password,
            database: database ? String(database) : database,
            logging: false,
        });
        await sequelize.authenticate();
        (0, logging_service_1.log)(`Good: dialect=${dialect}, host=${host}, port=${port}, username=${username}, database=${database}`);
        return sequelize;
    }
    catch (error) {
        vscode.window.showErrorMessage(`Connection error for '${dialect} dialect': ${String(error)}`);
        (0, logging_service_1.log)(`Connection error for '${dialect}' dialect: ${String(error)}`, error);
        return;
    }
}
//# sourceMappingURL=sequelize-connector.js.map