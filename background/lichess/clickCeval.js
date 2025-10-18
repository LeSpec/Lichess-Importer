import executeScriptInTab from "../executeScriptInTab.js";

function turnOnCevalToggle() {
    const cevalToggle = document.querySelector("#analyse-toggle-ceval");
    if (cevalToggle && !cevalToggle.checked) {
        cevalToggle.click(); // .checked = true doesn't open lines, not having the tab active still has that effect
    } else {
        browser.runtime.sendMessage({
            type: "ERROR",
            context: "Could not find ceval toggle",
            error: e,
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
    browser.tabs.onUpdated.addListener(async function listener(tabId, changeInfo, tab) {
        if (tabId === gameTabId && tab.status === "complete") {
            browser.tabs.onUpdated.removeListener(listener);
            executeWhenTabIsActive(tabId, turnOnCevalToggle);
        }
    });
}
