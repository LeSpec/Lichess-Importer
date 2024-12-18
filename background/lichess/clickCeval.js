import executeScriptInTab from "../executeScriptInTab.js";

function turnOnCevalToggle() {
    try {
        const analyseTools = document.querySelector(".analyse__tools");
        if (!analyseTools) throw "Did not find analyse tools";

        const config = { childList: true, subtree: true };
        const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach((node) => {
                        if (node.id === "analyse-toggle-ceval") {
                            observer.disconnect();
                            node.checked = true;
                        }
                    });
                }
            }
        };
        const observer = new MutationObserver(callback);
        observer.observe(analyseTools, config);

        // in case ceval toggle got added before observation
        const toggleCeval = document.querySelector("#analyse-toggle-ceval");
        if (toggleCeval) {
            observer.disconnect();
            toggleCeval.click(); // .checked = true doesn't open lines, not having the tab active still has that effect
        }
    } catch (e) {
        browser.runtime.sendMessage({
            type: "ERROR",
            context: "Could not enable computer evaluation",
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
