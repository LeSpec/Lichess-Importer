export default function runAfterLichessComplete(lichessTabId, func) {
    const filter = {
        urls: ["*://lichess.org/*"], // if we click before chess.com has finished loading, we need to make sure status complete isn't from chess.com
        properties: ["status"],
        tabId: lichessTabId,
    };

    function listener(tabId, changeInfo, tab) {
        if (changeInfo.status === "complete") {
            browser.tabs.onUpdated.removeListener(listener);
            func();
        }
    }

    browser.tabs.onUpdated.addListener(listener, filter);
}
