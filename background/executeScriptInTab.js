import { handleError } from "../lib/utility.js";

export default function executeScriptInTab(tabId, func, args) {
    try {
        browser.scripting.executeScript({
            target: { tabId: tabId },
            func: func,
            args: args,
            injectImmediately: true,
        });
    } catch (e) {
        handleError("Failed to execute script " + func.name, e);
    }
}
