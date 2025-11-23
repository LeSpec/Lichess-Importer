function redirectClicks(event) {
    const anchorElement = event.target.closest("a");
    if (!anchorElement) return;

    const isSpecialKeyPressed = event.metaKey || event.ctrlKey;
    if (!isSpecialKeyPressed) return;

    const anchorUrl = anchorElement.href;
    if (
        anchorUrl.startsWith("https://www.chess.com/game/") ||
        anchorUrl.startsWith("https://www.chess.com/analysis/game/")
    ) {
        event.preventDefault();
        browser.runtime.sendMessage({
            type: "GAME_LINK_CLICKED",
            chesscomGameUrl: anchorUrl,
        });
    }
}

const columnOne = document.querySelector(".layout-column-one");
if (columnOne) {
    columnOne.addEventListener("click", redirectClicks);
} else {
    documentUrl = document.location.href;
    if (
        // there should be a game table on those pages
        documentUrl.startsWith("https://www.chess.com/games/archive/") ||
        documentUrl.startsWith("https://www.chess.com/member/")
    ) {
        const e = new Error("No element with class layout-column-one");
        browser.runtime.sendMessage({
            type: "ERROR",
            name: e.name,
            message: e.message,
            stack: e.stack,
        });
    }
}
