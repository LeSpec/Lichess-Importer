import { handleError, measureTime } from "../../lib/utility.js";

async function getUserName(playersData, userUuid) {
    if (userUuid === playersData.top.uuid) {
        return playersData.top.username;
    } else if (userUuid === playersData.bottom.uuid) {
        return playersData.bottom.username;
    } else {
        return null; // user did not play this game
    }
}

/* 
Decide if we want to view the board from white or black's perspective
 */
async function decideViewedPlayer(playersData, senderUrl, uuidPromise) {
    const userPerspectiveUrls = [
        "https://www.chess.com/home",
        "https://www.chess.com/game/",
        "https://www.chess.com/analysis/game/",
    ];
    const archiveUrl = "https://www.chess.com/games/archive/";
    const memberUrl = "https://www.chess.com/member/";

    const isUserUrl = userPerspectiveUrls.some((url) => senderUrl.startsWith(url));
    const isMemberUrl = senderUrl.startsWith(memberUrl);
    const isArchiveUrl = senderUrl.startsWith(archiveUrl);

    let viewedPlayer;

    if (isUserUrl) {
        const userUuid = await measureTime("User uuid download", () => uuidPromise);
        viewedPlayer = getUserName(playersData, userUuid);
    } else if (isMemberUrl) {
        viewedPlayer = senderUrl.slice(memberUrl.length).split("?")[0];
    } else if (isArchiveUrl) {
        viewedPlayer = senderUrl.slice(archiveUrl.length).split("?")[0];
    } else {
        viewedPlayer = null;
    }

    return viewedPlayer;
}

export default async function shouldFlipBoard(playersData, senderUrl, uuidPromise) {
    let viewedPlayer = await decideViewedPlayer(playersData, senderUrl, uuidPromise);
    if (!viewedPlayer) return false;
    viewedPlayer = viewedPlayer.toLowerCase();

    let viewedColor;
    if (viewedPlayer === playersData.top.username.toLowerCase()) {
        viewedColor = playersData.top.color;
    } else if (viewedPlayer === playersData.bottom.username.toLowerCase()) {
        viewedColor = playersData.bottom.color;
    } else {
        handleError(viewedPlayer + " did not play this game");
    }

    if (viewedColor === "black") {
        return true;
    } else {
        return false;
    }
}
