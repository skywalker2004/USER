"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class actionProvider {
    provideCodeActions(document, range, context, token) {
        let text = document.getText(range);
        if (/^(\'|\")[_a-z0-9]+(\.[_a-z0-9]+)*(\"|\')$/.test(text)) {
            let view_name = text.replace(/\"|\'/g, '');
            return [{
                    title: 'Laravel: Create view',
                    command: 'extension.createView',
                    arguments: [view_name],
                }];
        }
        else {
            return;
        }
    }
}
exports.default = actionProvider;
//# sourceMappingURL=actionProvider.js.map