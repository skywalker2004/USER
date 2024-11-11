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
exports.showWelcomeMessage = showWelcomeMessage;
const vscode = __importStar(require("vscode"));
const BUTTON_STAR_GITHUB_REPO = "⭐️ Star on GitHub";
const BUTTON_FOLLOW_ON_X = "𝕏 Follow";
const BUTTON_SHARE_ON_X = "𝕏 Share";
const BUTTON_REPORT_ISSUE = "🐞 Report issue";
function showWelcomeMessage(context) {
    const extensionConfig = vscode.workspace.getConfiguration('Devdb');
    if (extensionConfig.dontShowNewVersionMessage) {
        return;
    }
    const previousVersion = getPreviousVersion(context);
    const currentVersion = getCurrentVersion();
    context.globalState.update("devdb-version" /* ExtensionConstants.globalVersionKey */, currentVersion);
    const previousVersionArray = getPreviousVersionArray(previousVersion);
    const currentVersionArray = getCurrentVersionArray(currentVersion);
    if (previousVersion === undefined || previousVersion.length === 0) {
        showMessageAndButtons(`Thanks for using DevDb.`, context);
        return;
    }
    if (currentVersion === previousVersion) {
        return;
    }
    if (isMajorUpdate(previousVersionArray, currentVersionArray) ||
        isMinorUpdate(previousVersionArray, currentVersionArray) ||
        isPatchUpdate(previousVersionArray, currentVersionArray)) {
        showMessageAndButtons(`DevDb updated to ${currentVersion}.`, context);
    }
}
function showMessageAndButtons(message, context) {
    const buttons = [];
    const userHasClickedGitHubStarring = hasClickedGitHubStarring(context);
    const userHasClickedToFollowOnX = hasClickedToFollowOnX(context);
    if (!userHasClickedGitHubStarring) {
        buttons.push(BUTTON_STAR_GITHUB_REPO);
    }
    if (!userHasClickedToFollowOnX) {
        buttons.push(BUTTON_FOLLOW_ON_X);
    }
    if (userHasClickedGitHubStarring || userHasClickedToFollowOnX) {
        buttons.push(BUTTON_SHARE_ON_X);
    }
    buttons.push(BUTTON_REPORT_ISSUE);
    vscode.window.showInformationMessage(message, ...buttons)
        .then(function (val) {
        switch (val) {
            case BUTTON_STAR_GITHUB_REPO:
                context.globalState.update("clicked-on-devdb-github-repo-starring" /* ExtensionConstants.clickedGitHubStarring */, true);
                vscode.env.openExternal(vscode.Uri.parse("https://github.com/damms005/devdb-vscode"));
                break;
            case BUTTON_FOLLOW_ON_X:
                context.globalState.update("clicked-to-follow-on-x" /* ExtensionConstants.clickedToFollowOnX */, true);
                vscode.env.openExternal(vscode.Uri.parse("https://twitter.com/_damms005"));
                break;
            case BUTTON_SHARE_ON_X:
                context.globalState.update("clicked-to-share-on-x" /* ExtensionConstants.clickedToShareOnX */, true);
                const message = getSafeRandomShareTweet();
                // https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/overview
                const twitterIntentUri = vscode.Uri.parse(`https://twitter.com/intent/tweet?text=${message}`);
                vscode.env.openExternal(twitterIntentUri);
                break;
            case BUTTON_REPORT_ISSUE:
                vscode.env.openExternal(vscode.Uri.parse("https://github.com/damms005/devdb-vscode/issues/new?assignees=&labels=bug%2Cunconfirmed%2Clow+priority&projects=&template=bug_report.yml"));
                break;
        }
    });
}
function isMajorUpdate(previousVersionArray, currentVersionArray) {
    return previousVersionArray[0] < currentVersionArray[0];
}
function isMinorUpdate(previousVersionArray, currentVersionArray) {
    return previousVersionArray[0] === currentVersionArray[0] &&
        previousVersionArray[1] < currentVersionArray[1];
}
function isPatchUpdate(previousVersionArray, currentVersionArray) {
    return previousVersionArray[0] === currentVersionArray[0] &&
        previousVersionArray[1] === currentVersionArray[1] &&
        previousVersionArray[2] < currentVersionArray[2];
}
function getCurrentVersionArray(currentVersion) {
    return currentVersion
        .split(".")
        .map((s) => Number(s));
}
function getPreviousVersionArray(previousVersion) {
    return previousVersion
        ? previousVersion.split(".").map((s) => Number(s))
        : [0, 0, 0];
}
function getCurrentVersion() {
    return vscode.extensions.getExtension("damms005.devdb" /* ExtensionConstants.extensionId */)?.packageJSON?.version;
}
function getPreviousVersion(context) {
    return context.globalState.get("devdb-version" /* ExtensionConstants.globalVersionKey */);
}
function hasClickedGitHubStarring(context) {
    return context.globalState.get("clicked-on-devdb-github-repo-starring" /* ExtensionConstants.clickedGitHubStarring */);
}
function hasClickedToFollowOnX(context) {
    return context.globalState.get("clicked-to-follow-on-x" /* ExtensionConstants.clickedToFollowOnX */);
}
/**
 * Gets a random message to share on X, within the 280 X character limit.
 * For the string to be 'safe', it must not contain any special characters because the URI may
 * get broken like so. VS Code opening link->Twitter decoding same is wacky, and neither
 * encodeUri nor encodeUriComponent is helpful for this. It is some bug in VS Code and/or Twitter
 * and I am not digging into that rabbit hole.
 */
function getSafeRandomShareTweet() {
    const messages = [
        "If you work with databases and use VS Code, you may want to check out DevDb. https://bit.ly/devdb",
        "DevDb is a VS Code extension that helps you work with databases. https://bit.ly/devdb",
        "DevDb makes working with databases in VS Code so much easier. https://bit.ly/devdb",
        "I just found this amazing VS Code extension for working with databases. It's called DevDb and it's awesome! https://bit.ly/devdb",
        "If you're a developer who works with databases, you should definitely check out DevDb for VS Code. https://bit.ly/devdb",
        "DevDb is a must-have VS Code extension for anyone who works with databases. https://bit.ly/devdb",
        "I use DevDb to work with databases in VS Code. It's a game changer! https://bit.ly/devdb",
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    return message;
}
//# sourceMappingURL=welcome-message-service.js.map