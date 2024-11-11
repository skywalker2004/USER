"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostname = getHostname;
exports.getEnvFileValue = getEnvFileValue;
const workspace_1 = require("../workspace");
/**
 * Returns the hostname portion of the APP_URL environment variable.
 */
async function getHostname() {
    const appUrl = await getEnvFileValue('APP_URL');
    if (!appUrl)
        return;
    const appUrlWithoutQuotes = appUrl.replace(/"/g, '');
    const appUrlWithoutTrailingSlash = appUrlWithoutQuotes.endsWith('/')
        ? appUrlWithoutQuotes.substring(0, appUrlWithoutQuotes.length - 1)
        : appUrlWithoutQuotes;
    const appUrlWithoutProtocol = appUrlWithoutTrailingSlash.replace(/https?:\/\//, '');
    const appUrlWithoutPort = appUrlWithoutProtocol.replace(/:\d+/, '');
    return appUrlWithoutPort;
}
async function getEnvFileValue(envFileKey) {
    const envFileContents = (0, workspace_1.getWorkspaceFileContent)('.env')?.toString();
    if (!envFileContents)
        return;
    const lines = envFileContents.split('\n');
    const appUrlLine = lines.find(line => line.startsWith(`${envFileKey}=`));
    if (!appUrlLine)
        return;
    const appUrl = appUrlLine.substring(appUrlLine.indexOf('=') + 1);
    const appUrlWithoutQuotes = appUrl.replace(/"/g, '');
    const appUrlWithoutTrailingSlash = appUrlWithoutQuotes.endsWith('/')
        ? appUrlWithoutQuotes.substring(0, appUrlWithoutQuotes.length - 1)
        : appUrlWithoutQuotes;
    const appUrlWithoutProtocol = appUrlWithoutTrailingSlash.replace(/https?:\/\//, '');
    const appUrlWithoutPort = appUrlWithoutProtocol.replace(/:\d+/, '');
    return appUrlWithoutPort.trim();
}
//# sourceMappingURL=laravel-core.js.map