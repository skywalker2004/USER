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
exports.FRONTEND_FOLDER_NAME = void 0;
exports.getWebviewHtml = getWebviewHtml;
exports.getVueAssets = getVueAssets;
exports.getNonce = getNonce;
const path_1 = require("path");
const vscode = __importStar(require("vscode"));
exports.FRONTEND_FOLDER_NAME = 'ui-shell';
/**
 * Gets the html for the webview
 */
function getWebviewHtml(webview, jsFile, cssFile, _extensionUri) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const vueAppScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(_extensionUri, exports.FRONTEND_FOLDER_NAME, 'dist', 'assets', jsFile));
    // Do the same for the stylesheet.
    const styleVueAppUri = webview.asWebviewUri(vscode.Uri.joinPath(_extensionUri, exports.FRONTEND_FOLDER_NAME, 'dist', 'assets', cssFile));
    // Use nonce to allow specific scripts to be run.
    const nonce1 = getNonce();
    const nonce2 = getNonce();
    /**
     * Tailwindcss uses svg loaded from data:image..., at least for checkboxes.
     */
    const tailwindcss = 'data:';
    return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src https://fonts.googleapis.com; img-src ${webview.cspSource} ${tailwindcss}; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce1}' 'nonce-${nonce2}'; connect-src https://icanhazdadjoke.com/ ">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleVueAppUri}" rel="stylesheet">
			</head>
			<body class="min-h-full min-w-full bg-white">
					<div id="app" class="w-full min-w-full h-full min-h-full" ></div>
					<script nonce="${nonce2}" src="${vueAppScriptUri}"></script>
			</body>
		</html>`;
}
/**
 * Gets the compiled Vue assets from the Vue project output folder
 */
async function getVueAssets(context) {
    const allFiles = await vscode.workspace.fs.readDirectory(vscode.Uri.file(context.extensionPath));
    return new Promise(async (resolve, reject) => {
        const uiFolder = allFiles.find((item) => item[0] === exports.FRONTEND_FOLDER_NAME && item[1] === vscode.FileType.Directory);
        if (uiFolder) {
            const projectFolder = (0, path_1.join)(context.extensionPath, exports.FRONTEND_FOLDER_NAME, 'dist', 'assets');
            const uiFiles = await vscode.workspace.fs.readDirectory(vscode.Uri.file(projectFolder));
            const jsFile = uiFiles.find((item) => item[1] === vscode.FileType.File && item[0].endsWith('.js'));
            const cssFile = uiFiles.find((item) => item[1] === vscode.FileType.File && item[0].endsWith('.css'));
            if (!jsFile || !cssFile)
                return;
            resolve({
                jsFile: jsFile[0],
                cssFile: cssFile[0]
            });
        }
        reject('Could not find UI assets');
    });
}
/**
 * Generates a random nonce for webview Content Security Policy
 */
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=html.js.map