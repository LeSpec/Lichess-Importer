import ErrorReporter from "./ErrorReporter.js";

let errorReporter;

async function hasTechPerm() {
    const perms = await browser.permissions.getAll();
    const techPerm =
        perms.data_collection?.includes("technicalAndInteraction") ?? false;
    return techPerm;
}

async function reportWithPerm(error) {
    const perm = await hasTechPerm();
    if (!perm) return;
    if (errorReporter === undefined) {
        errorReporter = new ErrorReporter();
    }
    errorReporter.report(error);
}

export function handleError(error) {
    console.error(error);
    reportWithPerm(error);
}

export function addGlobalErrorReporting() {
    window.addEventListener("error", (event) => {
        reportWithPerm(event.error);
    });

    window.addEventListener("unhandledrejection", (event) => {
        reportWithPerm(event.reason);
    });
}

export async function measureTime(infoTag, task) {
    const start = performance.now();
    const result = await task();
    const end = performance.now();
    logMessage(`${infoTag}: ${end - start} ms`);
    return result;
}

export function logMessage(...message) {
    console.log(...message);
}

export class DetailedError extends Error {
    constructor(message, details = {}, options = {}) {
        const detailedMessage = [
            message,
            ...Object.entries(details).map(([k, v]) => `${k}: ${v}`),
        ].join("\n");
        super(detailedMessage, options);
        this.plainMessage = message;
        this.details = details;

        // Capture stack trace correctly
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    omitDetails() {
        const rawError = new Error(this.plainMessage, { cause: this.cause });
        rawError.stack = this.stack;
        return rawError;
    }

    sanitizeDetails() {
        const allowedUrlKeywords = [
            "game",
            "analysis",
            "live",
            "daily",
            "home",
            "games",
            "archive",
            "member",
            "review",
        ];
        const sanitizedDetails = Object.fromEntries(
            Object.entries(this.details).map(([k, v]) => [
                k,
                sanitizeStr(v + "", allowedUrlKeywords),
            ]),
        );
        const sanitizedError = new DetailedError(
            this.plainMessage + "",
            sanitizedDetails,
            {
                cause: this.cause,
            },
        );
        sanitizedError.stack = this.stack;
        return sanitizedError;
    }
}

function sanitizeStr(str, allowed = []) {
    const urlRegex = /https?:\/\/[^\s]+/i;
    const urlMatch = str.match(urlRegex);

    const repl = (s) => s.replace(/[A-Za-z]/g, "L").replace(/[0-9]/g, "N");

    if (urlMatch) {
        let url = urlMatch[0];
        const parts = url.split("/");

        return parts
            .map((p, i) => {
                if (i <= 2) return p; // keep protocol and domain
                if (allowed.includes(p)) return p;
                return repl(p);
            })
            .join("/");
    }

    return repl(str);
}
