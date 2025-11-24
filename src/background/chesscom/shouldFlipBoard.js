import { DetailedError } from "../utility.js";

export default function shouldFlipBoard(playersData, senderUrl, userUuid) {
    const homeUrl = "https://www.chess.com/home";
    const gameUrls = [
        "https://www.chess.com/game/",
        "https://www.chess.com/analysis/game/",
    ];
    const memberUrl = "https://www.chess.com/member/";
    const archiveUrl = "https://www.chess.com/games/archive/";

    const isHomeUrl = senderUrl.startsWith(homeUrl);
    const isGameUrl = gameUrls.some((url) => senderUrl.startsWith(url));
    const isMemberUrl = senderUrl.startsWith(memberUrl);
    const isArchiveUrl = senderUrl.startsWith(archiveUrl);

    let bottomColor;
    let username;
    if (isHomeUrl) {
        bottomColor = getColorByUuid(userUuid, playersData);
    } else if (isGameUrl) {
        bottomColor = getColorByUuid(userUuid, playersData);
    } else if (isMemberUrl) {
        username = extractUsername(senderUrl, memberUrl);
        bottomColor = getColorByUsername(username, playersData);
    } else if (isArchiveUrl) {
        username = extractUsername(senderUrl, archiveUrl);
        bottomColor = getColorByUsername(username, playersData);
    }

    // The user related to home, member or archive page should be one of the players
    if ((isHomeUrl || isMemberUrl || isArchiveUrl) && !bottomColor) {
        throw new DetailedError(`User did not play this game`, {
            ...(username ? { username } : { userUuid }),
            senderUrl,
        });
    }

    return bottomColor === "black";
}

function getColorByUuid(uuid, playersData) {
    if (uuid === playersData.top.uuid) return playersData.top.color;
    if (uuid === playersData.bottom.uuid) return playersData.bottom.color;
    return null;
}
function getColorByUsername(username, playersData) {
    if (username === playersData.top.username.toLowerCase())
        return playersData.top.color;
    if (username === playersData.bottom.username.toLowerCase())
        return playersData.bottom.color;
    return null;
}

function extractUsername(url, prefix) {
    return url
        .slice(prefix.length)
        .split(/[\/?#]/)[0]
        .toLowerCase();
}
