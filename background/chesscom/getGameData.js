import { handleError } from "../../lib/utility.js";

function transformToCallbackUrl(chesscomUrl) {
    const trimmedUrl = chesscomUrl.trim();
    const regex = /^https:\/\/www\.chess\.com\/(analysis\/)?game\/((live|daily)\/)?(\d+)(\?.*)?$/;

    const match = trimmedUrl.match(regex);
    if (!match) {
        handleError(`Could not transform ${chesscomUrl} to callback url`);
        return null;
    }

    const [, analysis, , type, gameId] = match;
    return `https://www.chess.com/callback/${type || "live"}/game/${gameId}`;
}

export default async function getGameData(chesscomUrl) {
    const callbackUrl = transformToCallbackUrl(chesscomUrl);
    if (!callbackUrl) return null;

    try {
        const response = await fetch(callbackUrl);
        if (!response.ok) throw "status " + response.status;

        let text = await response.text();
        text = text.replace(/\\\\'/g, "'"); // Fix problem with {"Event": "Let\\'s play!"}
        const data = JSON.parse(text);

        return data;
    } catch (e) {
        handleError("Failed to get game data for " + callbackUrl, e);
        return null;
    }
}
