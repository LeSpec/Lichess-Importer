import executeScriptInTab from "../executeScriptInTab.js";
import runAfterLichessComplete from "../runAfterLichessComplete.js";

async function clickScript() {
    try {
        const analysisForm = document.querySelector(".future-game-analysis");
        if (!analysisForm) {
            if (document.querySelector("#acpl-chart-container")) {
                return;
            } else {
                throw new Error("Computer analysis form not found");
            }
        }

        const submitButton = analysisForm.childNodes[0];
        if (!submitButton) throw new Error("Submit button not found");

        submitButton.click();
    } catch (e) {
        browser.runtime.sendMessage({
            type: "ERROR",
            name: e.name,
            message: "Clicking analysis button failed, cause: " + e.message,
            stack: e.stack,
        });
    }
}

export default function clickAnalysis(gameTabId) {
    const func = () => executeScriptInTab(gameTabId, clickScript);
    runAfterLichessComplete(gameTabId, func);
}
