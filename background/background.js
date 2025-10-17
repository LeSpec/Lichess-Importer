import { measureTime, handleError, logMessage } from "../lib/utility.js";
import gameDataToPgn from "./chesscom/gameDataToPgn.js";
import getGameData from "./chesscom/getGameData.js";
import getUserUuid from "./chesscom/getUserUuid.js";
import shouldFlipBoard from "./chesscom/shouldFlipBoard.js";
import clickAnalysis from "./lichess/clickAnalysis.js";
import clickCeval from "./lichess/clickCeval.js";
import importGame from "./lichess/importGame.js";

// Check host permissions
const manifest = browser.runtime.getManifest();
const hostPermissions = manifest.host_permissions;
const allMatches = manifest.content_scripts.flatMap((script) => script.matches);
const requiredPermissions = {
    origins: [...hostPermissions, ...allMatches],
};
browser.permissions.contains(requiredPermissions).then((hasPermissions) => {
    if (!hasPermissions) {
        handleError("Missing host permissions");
    }
});

// cache uuid, since chess.com's servers sometimes respond slowly
let uuidCache = null;
function fetchAndStoreUuid(senderTab) {
    // for debugging it might be useful to measure time
    getUserUuid(senderTab).then((uuid) => (uuidCache = uuid));
}

browser.runtime.onMessage.addListener((message, sender) => {
    try {
        if (message.type === "GAME_LINK_CLICKED" || message.type === "GAME_PAGE_CLICKED") {
            logMessage("Opening game on Lichess...");
            measureTime("Time total", async () =>
                openOnLichess(message.chesscomGameUrl, sender.tab).catch((e) =>
                    handleError(openOnLichess.name + " failed", e)
                )
            );
        } else if (message.type === "UUID_REQUEST") {
            fetchAndStoreUuid(sender.tab);
        } else if (message.type === "ERROR") {
            handleError(message.context, message.error);
        } else if (!message.type) {
            // for debugging
            console.log(message);
        }
    } catch (e) {
        handleError("Background message listener failed", e);
    }
});

async function openOnLichess(chesscomGameUrl, senderTab) {
    const analyze = true;
    const newTab = true;
    const activeTab = true;

    // start fetching uuid, hopefully uuid cache holds the new value by the time we use it
    fetchAndStoreUuid(senderTab);

    const data = await measureTime("Chess.com download", () => getGameData(chesscomGameUrl));
    if (!data) return;

    const gameData = data.game;
    const playersData = data.players;

    const pgn = gameDataToPgn(gameData);

    let importUrl = await measureTime("Lichess upload", () => importGame(pgn));
    if (!importUrl) return;

    const flipBoard = await shouldFlipBoard(playersData, senderTab.url, uuidCache);
    const orientationSuffix = flipBoard ? "/black" : "/white";

    const options = { newTab, activeTab, senderTab };
    const gameTab = await loadGame(importUrl + orientationSuffix, options);

    if (analyze) clickAnalysis(gameTab.id);

    clickCeval(gameTab.id);
}

async function loadGame(importUrl, { newTab, activeTab, senderTab }) {
    return newTab
        ? browser.tabs.create({
              url: importUrl,
              active: activeTab,
              index: senderTab.index + 1,
          })
        : browser.tabs.update(senderTab.id, { url: importUrl });
}
