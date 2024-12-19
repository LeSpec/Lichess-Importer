import { createTimer, handleError } from "../lib/utility.js";
import gameDataToPgn from "./chesscom/gameDataToPgn.js";
import getGameData from "./chesscom/getGameData.js";
import getUserUuid from "./chesscom/getUserUuid.js";
import shouldFlipBoard from "./chesscom/shouldFlipBoard.js";
import clickAnalysis from "./lichess/clickAnalysis.js";
import clickCeval from "./lichess/clickCeval.js";
import importGame from "./lichess/importGame.js";
import { measureTime } from "../lib/utility.js";

browser.runtime.onMessage.addListener((message, sender) => {
    try {
        if (message.type === "GAME_LINK_CLICKED" || message.type === "GAME_PAGE_CLICKED") {
            measureTime("Time total", async () =>
                openOnLichess(message.chesscomGameUrl, sender.tab).catch((e) =>
                    handleError(openOnLichess.name + " failed", e)
                )
            );
        } else if (message.type === "ERROR") {
            handleError(message.context, message.error);
        } else if (!message.type) {
            console.log(message);
        }
    } catch (e) {
        handleError("background message listener failed", e);
    }
});

async function openOnLichess(chesscomGameUrl, senderTab) {
    const analyze = true;
    const newTab = true;
    const activeTab = true;

    const uuidPromise = getUserUuid(senderTab); // start fetching uuid before actually needed to improve performance

    const data = await measureTime("Chess.com download", async () => getGameData(chesscomGameUrl));
    if (!data) return;

    const gameData = data.game;
    const playersData = data.players;

    const pgn = gameDataToPgn(gameData);

    let importUrl = await measureTime("Lichess upload", async () => importGame(pgn));
    if (!importUrl) return;

    const flipBoard = await shouldFlipBoard(playersData, senderTab.url, uuidPromise);
    const orientationSuffix = flipBoard ? "/black" : "/white";

    const options = { newTab, activeTab, tabIndex: senderTab.index + 1 };
    const gameTab = await loadGame(importUrl + orientationSuffix, options);

    if (analyze) clickAnalysis(gameTab.id);

    clickCeval(gameTab.id);
}

async function loadGame(importUrl, { newTab, activeTab, tabIndex }) {
    return newTab
        ? browser.tabs.create({
              url: importUrl,
              active: activeTab,
              index: tabIndex,
          })
        : browser.tabs.update({ url: importUrl });
}
