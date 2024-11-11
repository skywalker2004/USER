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
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const devdb_view_provider_1 = require("./devdb-view-provider");
const html_1 = require("./services/html");
const code_lens_service_1 = require("./services/codelens/code-lens-service");
const welcome_message_service_1 = require("./services/welcome-message-service");
let devDbViewProvider;
async function activate(context) {
    (0, welcome_message_service_1.showWelcomeMessage)(context);
    let assets;
    try {
        assets = await (0, html_1.getVueAssets)(context);
    }
    catch (error) {
        return vscode.window.showErrorMessage(`Could not load frontend assets: ${String(error)}`);
    }
    if (!assets)
        return vscode.window.showErrorMessage('Could not load frontend assets');
    if (!devDbViewProvider) {
        devDbViewProvider = new devdb_view_provider_1.DevDbViewProvider(context, assets.jsFile, assets.cssFile);
    }
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(devdb_view_provider_1.DevDbViewProvider.viewType, devDbViewProvider, {
        webviewOptions: {
            retainContextWhenHidden: true,
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('devdb.codelens.open-laravel-model-table', tableName => {
        if (!devDbViewProvider)
            return;
        devDbViewProvider.setActiveTable(tableName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('devdb.context-menu.open-table-at-cursor', () => {
        if (!devDbViewProvider)
            return;
        devDbViewProvider.openTableAtCurrentCursor();
    }));
    const codelensProvider = new code_lens_service_1.CodelensProvider();
    vscode.languages.registerCodeLensProvider({ scheme: 'file', language: 'php' }, codelensProvider);
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('Devdb')) {
            devDbViewProvider?.notifyConfigChange(event);
        }
    });
}
//# sourceMappingURL=extension.js.map