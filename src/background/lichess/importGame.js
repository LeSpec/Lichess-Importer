/*
Lichess.org API reference: https://lichess.org/api#tag/Games/operation/gameImport
 */
export default async function importGame(pgn) {
    try {
        const response = await fetch("https://lichess.org/api/import", {
            method: "POST",
            headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ pgn: pgn, pgnFile: "", analysis: true }).toString(),
        });
        const responseJson = await response.json();

        if (!response.ok) throw new Error(`status ${response.status} ${responseJson.error}`);

        const importedGameUrl = responseJson.url;
        return importedGameUrl;
    } catch (e) {
        throw new Error("Lichess import failed", { cause: e });
    }
}
