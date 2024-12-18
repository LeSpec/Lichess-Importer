import executeScriptInTab from "../executeScriptInTab.js";

async function clickScript() {
    try {
        const analysisForm = document.querySelector(".future-game-analysis");
        if (!analysisForm) {
            if (document.querySelector("#acpl-chart-container")) {
                return;
            } else {
                throw "Computer analysis form not found";
            }
        }

        const submitButton = analysisForm.childNodes[0];
        if (!submitButton) throw "Submit button not found";

        submitButton.click();
    } catch (e) {
        browser.runtime.sendMessage({ type: "ERROR", context: "Clicking analysis button failed", error: e });
    }
}

export default function clickAnalysis(gameTabId) {
    browser.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
        if (tabId === gameTabId && tab.status === "complete") {
            browser.tabs.onUpdated.removeListener(listener);
            executeScriptInTab(tabId, clickScript);
        }
    });
}
