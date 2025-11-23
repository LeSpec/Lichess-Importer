import path from "path";
import { config } from "dotenv";
import webExt from "web-ext";

// Load .env variables
config();

const profilePath = process.env.FIREFOX_PROFILE;

if (!profilePath) {
    throw new Error("FIREFOX_PROFILE is not set in .env");
}

async function run() {
    await webExt.cmd.run({
        firefoxProfile: profilePath,
        sourceDir: path.resolve("./"),
        startUrl: "about:debugging#/runtime/this-firefox",
        pref: ["browser.startup.homepage_override.mstone=ignore"],
        reload: true,
    });
}

run().catch(console.error);
