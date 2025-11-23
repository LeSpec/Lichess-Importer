import { DetailedError } from "../utility.js";

function transformToCallbackUrl(chesscomGameUrl) {
    const trimmedUrl = chesscomGameUrl.trim();
    const regex = /^https:\/\/www\.chess\.com\/(analysis\/)?game\/((live|daily)\/)?(\d+)(.*)?$/;

    const match = trimmedUrl.match(regex);
    if (!match) {
        throw new DetailedError(`Could not transform Chess.com game url to callback url`, {
            chesscomGameUrl,
        });
    }

    const [, analysis, , type, gameId] = match;
    return `https://www.chess.com/callback/${type || "live"}/game/${gameId}`;
}

export default async function getGameData(chesscomUrl) {
    const callbackUrl = transformToCallbackUrl(chesscomUrl);

    try {
        const response = await fetch(callbackUrl);
        if (!response.ok) throw new Error("status " + response.status);

        let text = await response.text();
        text = text.replace(/\\\\'/g, "'"); // Fix problem with {"Event": "Let\\'s play!"}
        const data = JSON.parse(text);

        return data;
    } catch (e) {
        throw new DetailedError("Failed to get game data for callback url", { callbackUrl }, { cause: e });
    }
}
