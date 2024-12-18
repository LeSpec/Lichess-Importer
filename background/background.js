import { createTimer, handleError } from "../lib/utility.js";
import gameDataToPgn from "./chesscom/gameDataToPgn.js";
import getGameData from "./chesscom/getGameData.js";
import getUserUuid from "./chesscom/getUserUuid.js";
import shouldFlipBoard from "./chesscom/shouldFlipBoard.js";
import clickAnalysis from "./lichess/clickAnalysis.js";
import clickCeval from "./lichess/clickCeval.js";
import importGame from "./lichess/importGame.js";

browser.runtime.onMessage.addListener((message, sender) => {
    try {
        if (message.type === "GAME_LINK_CLICKED" || message.type === "GAME_PAGE_CLICKED") {
            openOnLichess(message.chesscomGameUrl, sender.tab).catch((e) =>
                handleError(openOnLichess.name + " failed", e)
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

    // for performance testing
    let t = createTimer("bg", false);

    const uuidPromise = getUserUuid(senderTab); // start fetching uuid before actually needed to improve performance

    t.log("game data");
    const data = await getGameData(chesscomGameUrl);
    t.log("game data complete");
    if (!data) return;

    const gameData = data.game;
    const playersData = data.players;

    const pgn = gameDataToPgn(gameData);

    t.log("import");
    let importUrl = await importGame(pgn);
    t.log("import complete");
    if (!importUrl) return;

    t.log("flip");
    const flipBoard = await shouldFlipBoard(playersData, senderTab.url, uuidPromise);
    t.log("flip complete");
    const orientationSuffix = flipBoard ? "/black" : "/white";

    const options = { newTab, activeTab, tabIndex: senderTab.index + 1 };
    t.log("load tab");
    const gameTab = await loadGame(importUrl + orientationSuffix, options);
    t.log("load tab complete");

    if (analyze) clickAnalysis(gameTab.id);

    clickCeval(gameTab.id);

    t.end();
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
