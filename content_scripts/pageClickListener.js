function redirectClicks(event) {
    const isSpecialKeyPressed = event.metaKey || event.ctrlKey;
    if (!isSpecialKeyPressed) return;

    const docuemntUrl = document.location.href;
    browser.runtime.sendMessage({
        type: "GAME_PAGE_CLICKED",
        chesscomGameUrl: docuemntUrl,
    });
}

document.body.addEventListener("click", redirectClicks).catch(
    browser.runtime.sendMessage({
        type: "ERROR",
        context: "Page click listener failed",
        error: e,
    })
);
