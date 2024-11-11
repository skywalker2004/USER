"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
function getWrapperConfig() {
    let config = vscode_1.workspace.getConfiguration("wrap");
    const items = config.get("with", {});
    const custom = config.get("custom", {});
    return Object.assign(Object.assign({}, items), custom);
}
const wrapperConfig = getWrapperConfig();
function getEnabledWrapperItems() {
    const items = [];
    Object.keys(wrapperConfig).forEach(wrapperItemKey => {
        const wrapperItem = wrapperConfig[wrapperItemKey];
        if (!wrapperItem.disabled) {
            items.push(wrapperItem);
        }
    });
    return items;
}
function getQuickPickItems(wrapperItems) {
    const items = [];
    wrapperItems.forEach(wrapperItem => {
        if (!wrapperItem.disabled) {
            const { label, description } = wrapperItem;
            items.push({
                label,
                description
            });
        }
    });
    return items;
}
function showQuickPick(item, wrapperItems) {
    let activeEditor = vscode_1.window.activeTextEditor;
    if (activeEditor && item) {
        let wrapperItem = wrapperItems.find(s => item.label === s.label);
        if (wrapperItem) {
            activeEditor.insertSnippet(new vscode_1.SnippetString(wrapperItem.snippet));
        }
    }
}
function showWrapItem(key) {
    if (vscode_1.window.activeTextEditor && wrapperConfig[key]) {
        const wrapperItem = wrapperConfig[key];
        vscode_1.window.activeTextEditor.insertSnippet(new vscode_1.SnippetString(wrapperItem.snippet));
    }
}
function registerCommands(context) {
    vscode_1.commands.getCommands().then(cmdWrapperList => {
        Object.keys(wrapperConfig).forEach(key => {
            const cmdText = `wrap.with.${key}`;
            if (cmdWrapperList.indexOf(cmdText) === -1) {
                context.subscriptions.push(vscode_1.commands.registerCommand(cmdText, () => {
                    showWrapItem(key);
                }));
            }
        });
    });
}
function activate(context) {
    let quickPickItems;
    let wrapperItems = [];
    function update() {
        wrapperItems = getEnabledWrapperItems();
        quickPickItems = getQuickPickItems(wrapperItems);
        registerCommands(context);
    }
    vscode_1.workspace.onDidChangeConfiguration(() => {
        update();
    });
    update();
    let disposable = vscode_1.commands.registerTextEditorCommand("wrap.with", editor => {
        if (editor.document.languageId !== 'blade') {
            return;
        }
        vscode_1.window.showQuickPick(quickPickItems).then(item => {
            if (item) {
                showQuickPick(item, wrapperItems);
            }
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=wrapper.js.map