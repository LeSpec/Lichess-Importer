import executeScriptInTab from "../executeScriptInTab.js";

function turnOnCevalToggle() {
    const cevalToggle = document.querySelector("#analyse-toggle-ceval");
    if (cevalToggle) {
        cevalToggle.click(); // .checked = true doesn't open lines, not having the tab active still has that effect
    } else {
        browser.runtime.sendMessage({
            type: "ERROR",
            context: "Could not find ceval toggle",
            error: e,
        });
    }
}

export default function clickCeval(gameTabId) {
    browser.tabs.onUpdated.addListener(async function listener(tabId, changeInfo, tab) {
        if (tabId === gameTabId && tab.status === "complete") {
            browser.tabs.onUpdated.removeListener(listener);
            executeScriptInTab(tabId, turnOnCevalToggle);
        }
    });
}
