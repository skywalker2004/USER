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
exports.DevDbViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const html_1 = require("./services/html");
const messenger_1 = require("./services/messenger");
const pluralize_1 = require("pluralize");
const case_1 = __importDefault(require("case"));
class DevDbViewProvider {
    constructor(context, jsFile, cssFile) {
        this.context = context;
        this.jsFile = jsFile;
        this.cssFile = cssFile;
        this._extensionUri = context.extensionUri;
    }
    async resolveWebviewView(webviewView, context, _token) {
        if (!this.jsFile || !this.cssFile)
            throw new Error('DevDb bundled asset files not found');
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = (0, html_1.getWebviewHtml)(webviewView.webview, this.jsFile, this.cssFile, this._extensionUri);
        webviewView.webview.onDidReceiveMessage(async (data) => {
            if (!this._view)
                return console.log(`Message received but the webview not available`);
            await (0, messenger_1.handleIncomingMessage)(data, this._view);
        });
    }
    setActiveTable(table) {
        if (!this._view)
            return console.log(`Message received but the webview not available`);
        if (!(0, messenger_1.isTablesLoaded)()) {
            return vscode.window.showErrorMessage(`Tables not loaded yet. Selected a database yet?`);
        }
        if (!(0, messenger_1.tableExists)(table))
            return vscode.window.showErrorMessage(`Table ${table} does not exist`);
        (0, messenger_1.sendMessageToWebview)(this._view.webview, { type: 'ide-action:show-table-data', value: table });
        this._view.show();
    }
    /**
     * Gets the word at the current cursor location and opens the table in the DevDb view
     */
    openTableAtCurrentCursor() {
        if (!(0, messenger_1.isTablesLoaded)()) {
            return vscode.window.showErrorMessage(`Tables not loaded yet. Selected a database yet?`);
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const document = editor.document;
        const cursorPosition = editor.selection.active;
        const wordRange = document.getWordRangeAtPosition(cursorPosition);
        const word = document.getText(wordRange);
        let tableName = case_1.default.snake(word);
        if (!(0, messenger_1.tableExists)(tableName)) {
            tableName = (0, pluralize_1.plural)(tableName);
            if (!(0, messenger_1.tableExists)(tableName)) {
                return vscode.window.showErrorMessage(`Table ${word} does not exist`);
            }
        }
        this.setActiveTable(tableName);
    }
    notifyConfigChange(event) {
        if (!this._view)
            return console.log(`Config changed but webview not available`);
        const newSettings = vscode.workspace.getConfiguration('Devdb');
        (0, messenger_1.sendMessageToWebview)(this._view.webview, { type: 'config-changed', value: newSettings });
    }
}
exports.DevDbViewProvider = DevDbViewProvider;
DevDbViewProvider.viewType = 'devdb';
//# sourceMappingURL=devdb-view-provider.js.map