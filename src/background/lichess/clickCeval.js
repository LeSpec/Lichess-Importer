import executeScriptInTab from "../executeScriptInTab.js";
import runAfterLichessComplete from "../runAfterLichessComplete.js";

function turnOnCevalToggle() {
    const cevalToggle = document.querySelector("#analyse-toggle-ceval");
    if (cevalToggle) {
        if (!cevalToggle.checked) {
            cevalToggle.click(); // .checked = true doesn't open lines, not having the tab active still has that effect
        }
    } else {
        const e = new Error("Could not find ceval toggle");
        browser.runtime.sendMessage({
            type: "ERROR",
            name: e.name,
            message: e.message,
            stack: e.stack,
        });
    }
}

function executeWhenTabIsActive(tabId, callback) {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs.length > 0 && tabs[0].id === tabId) {
            executeScriptInTab(tabId, callback); // Execute immediately if active
        } else {
            browser.tabs.onActivated.addListener(function listener(activeInfo) {
                if (activeInfo.tabId === tabId) {
                    browser.tabs.onActivated.removeListener(listener);
                    executeScriptInTab(tabId, callback);
                }
            });
        }
    });
}

export default function clickCeval(gameTabId) {
    const func = () => executeWhenTabIsActive(gameTabId, turnOnCevalToggle);
    runAfterLichessComplete(gameTabId, func);
}
