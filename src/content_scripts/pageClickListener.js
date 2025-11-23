function redirectClicks(event) {
    const isSpecialKeyPressed = event.metaKey || event.ctrlKey;
    if (!isSpecialKeyPressed) return;

    const docuemntUrl = document.location.href;
    if (
        docuemntUrl.startsWith("https://www.chess.com/game/") ||
        docuemntUrl.startsWith("https://www.chess.com/analysis/game/")
    ) {
        event.preventDefault();
        browser.runtime.sendMessage({
            type: "GAME_PAGE_CLICKED",
            chesscomGameUrl: docuemntUrl,
        });
    }
}

document.body.addEventListener("click", redirectClicks);
