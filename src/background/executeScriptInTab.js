import { handleError } from "./utility.js";

export default function executeScriptInTab(tabId, func, args) {
    try {
        browser.scripting.executeScript({
            target: { tabId: tabId },
            func: func,
            args: args,
            injectImmediately: true,
        });
    } catch (e) {
        throw new Error("Failed to execute script " + func.name, { cause: e });
    }
}
