import {
    measureTime,
    handleError,
    logMessage,
    DetailedError,
    addGlobalErrorReporting,
} from "./utility.js";
import { defaultSettings, settingIds } from "../settings.js";
import storageCache from "./storageCache.js";
import gameDataToPgn from "./chesscom/gameDataToPgn.js";
import getGameData from "./chesscom/getGameData.js";
import getUserUuid from "./chesscom/getUserUuid.js";
import shouldFlipBoard from "./chesscom/shouldFlipBoard.js";
import clickAnalysis from "./lichess/clickAnalysis.js";
import clickCeval from "./lichess/clickCeval.js";
import importGame from "./lichess/importGame.js";

// cache uuid, since chess.com's servers sometimes respond slowly
let uuidCache = null;

addGlobalErrorReporting();

logMessage("Extension version:", browser.runtime.getManifest().version);

checkHostPermissions();

browser.runtime.onInstalled.addListener((details) => {
    try {
        if (details.reason === "install") {
            browser.storage.local.set(defaultSettings).catch((e) => {
                throw new Error(e);
            });
        } else if (details.reason === "update") {
            browser.storage.local
                .get()
                .then((storage) => {
                    for (const id of settingIds) {
                        if (storage[id] === undefined) {
                            browser.storage.local.set({
                                [id]: defaultSettings[id],
                            });
                        }
                    }
                })
                .catch((e) => {
                    throw new Error(e);
                });
        }
    } catch (e) {
        handleError(new Error("Installing settings failed", { cause: e }));
    }
});

browser.runtime.onMessage.addListener((message, sender) => {
    try {
        if (
            message.type === "GAME_LINK_CLICKED" ||
            message.type === "GAME_PAGE_CLICKED"
        ) {
            logMessage("Opening game on Lichess...");
            const chesscomGameUrl = message.chesscomGameUrl;
            measureTime("Import time total", () =>
                openOnLichess(chesscomGameUrl, sender.tab),
            ).catch((e) =>
                handleError(
                    new DetailedError(
                        `${openOnLichess.name} failed`,
                        { chesscomGameUrl },
                        { cause: e },
                    ),
                ),
            );
        } else if (message.type === "UUID_REQUEST") {
            fetchAndStoreUuid(sender.tab);
        } else if (message.type === "ERROR") {
            const e = new Error();
            e.name = message.name;
            e.message = message.message;
            e.stack = message.stack;
            handleError(e);
        } else if (!message.type) {
            // for debugging
            console.log(message);
        }
    } catch (e) {
        handleError(
            new Error("Background message listener failed", { cause: e }),
        );
    }
});

async function openOnLichess(chesscomGameUrl, senderTab) {
    checkHostPermissions();

    // start fetching uuid, hopefully uuid cache holds the new value by the time we use it
    fetchAndStoreUuid(senderTab);

    const data = await measureTime("Chess.com download", () =>
        getGameData(chesscomGameUrl),
    );

    const gameData = data.game;
    const playersData = data.players;

    const pgn = gameDataToPgn(gameData);

    let importUrl = await measureTime("Lichess upload", () => importGame(pgn));

    const flipBoard = shouldFlipBoard(playersData, senderTab.url, uuidCache);
    const orientationSuffix = flipBoard ? "/black" : "/white";

    const gameTab = await loadGame(importUrl + orientationSuffix, senderTab);

    if (storageCache["compAnalysis"]) clickAnalysis(gameTab.id);

    clickCeval(gameTab.id);

    measureTime("Opening Lichess", () => waitForTab(gameTab.id));
}

async function checkHostPermissions() {
    const manifest = browser.runtime.getManifest();
    const hostPermissions = manifest.host_permissions;
    const allMatches = manifest.content_scripts.flatMap(
        (script) => script.matches,
    );
    const requiredPermissions = [...hostPermissions, ...allMatches];

    const missingPermissions = [];
    for (const p of requiredPermissions) {
        const hasPermission = await browser.permissions.contains({
            origins: [p],
        });
        if (!hasPermission) missingPermissions.push(p);
    }

    if (missingPermissions.length > 0) {
        handleError(
            new Error(
                "Missing host permissions:\n" + missingPermissions.join("\n"),
            ),
        );
    }
}

function fetchAndStoreUuid(senderTab) {
    // for debugging it might be useful to measure time
    getUserUuid(senderTab).then((uuid) => (uuidCache = uuid));
}

async function loadGame(importUrl, senderTab) {
    return storageCache["newTab"]
        ? browser.tabs.create({
              url: importUrl,
              active: true,
              index: senderTab.index + 1,
          })
        : browser.tabs.update(senderTab.id, { url: importUrl });
}

function waitForTab(waitTabId) {
    return new Promise((resolve) => {
        const filter = {
            properties: ["status"],
            tabId: waitTabId,
        };

        function listener(tabId, changeInfo, tab) {
            if (changeInfo.status === "complete") {
                browser.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        }

        browser.tabs.onUpdated.addListener(listener, filter);
    });
}
