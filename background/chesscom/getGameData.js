import { handleError } from "../../lib/utility.js";

function transformToCallbackUrl(chesscomUrl) {
    return chesscomUrl
        .trim()
        .replace(
            /^https:\/\/www\.chess\.com\/(analysis\/)?game\/(live|daily)\/(\d+)(\?.*)?$/,
            "https://www.chess.com/callback/$2/game/$3"
        );
}

export default async function getGameData(chesscomUrl) {
    const callbackUrl = transformToCallbackUrl(chesscomUrl);
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
