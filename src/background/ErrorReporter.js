import Bugsnag from "../lib/bugsnag/web-worker.min.js";
import { DetailedError } from "./utility.js";

const relStage = await getReleaseStage();

export default class ErrorReporter {
    constructor() {
        Bugsnag.start({
            apiKey: "e15da60b6ef32a8b70a6044123281454",
            appVersion: browser.runtime.getManifest().version,
            releaseStage: relStage,
        });
    }

    report(error) {
        if (error instanceof DetailedError) {
            error = error.sanitizeDetails();
        }
        Bugsnag.notify(error);
    }
}

async function getReleaseStage() {
    const self = await browser.management.getSelf();
    return self.installType === "development" ? "development" : "production";
}
