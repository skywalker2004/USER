"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasLaravelSailDockerComposeFile = hasLaravelSailDockerComposeFile;
exports.getPortFromDockerCompose = getPortFromDockerCompose;
const path_1 = require("path");
const workspace_1 = require("../workspace");
const laravel_core_1 = require("./laravel-core");
const yaml_1 = require("yaml");
async function hasLaravelSailDockerComposeFile() {
    const workspacePath = (0, workspace_1.getFirstWorkspacePath)();
    if (!workspacePath)
        return false;
    const dockerComposeFilePath = (0, path_1.join)(workspacePath, 'docker-compose.yml');
    const exists = await (0, workspace_1.fileExists)(dockerComposeFilePath);
    return exists;
}
async function getPortFromDockerCompose(dialect) {
    const dockerComposeContent = ((0, workspace_1.getWorkspaceFileContent)('docker-compose.yml'))?.toString();
    if (!dockerComposeContent)
        return;
    const dockerComposeParsed = (0, yaml_1.parse)(dockerComposeContent);
    const portDefinition = dockerComposeParsed.services?.[dialect]?.ports[0].toString();
    if (!portDefinition)
        return;
    // Match string like '${FORWARD_DB_PORT:-3307}:3306' where FORWARD_DB_PORT and 3307 are captured
    const match = portDefinition.match(/\${(\w+):-(\d+)}:\d+/);
    if (!match)
        return;
    const [, envVariable, defaultPort,] = match;
    const port = await (0, laravel_core_1.getEnvFileValue)(envVariable) || defaultPort;
    return parseInt(port);
}
//# sourceMappingURL=sail.js.map