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
    columnOne
        .addEventListener("click", redirectClicks)
        .catch(
            browser.runtime.sendMessage({ type: "ERROR", context: "Anchor click listener failed", error: e })
        );
} else {
    documentUrl = document.location.href;
    if (
        // there is no game table on those pages
        !documentUrl.startsWith("https://www.chess.com/game/") &&
        !documentUrl.startsWith("https://www.chess.com/analysis/game/")
    ) {
        browser.runtime.sendMessage({
            type: "ERROR",
            context: "No element with class layout-column-one",
        });
    }
}
