import fs from "fs";
import esbuild from "esbuild";
import { spawn } from "child_process";

fs.mkdirSync("./src/lib/bugsnag", { recursive: true });
esbuild
    .build({
        entryPoints: ["@bugsnag/web-worker"],
        bundle: true,
        format: "esm",
        minify: true,
        outfile: "./src/lib/bugsnag/web-worker.min.js",
    })
    .catch(() => process.exit(1));

fs.mkdirSync("./src/lib/chessops", { recursive: true });
esbuild.build({
    entryPoints: ["chessops"],
    bundle: true,
    format: "esm",
    minify: true,
    outfile: "./src/lib/chessops/chessops.min.js",
});

spawn(
    "npx",
    [
        "tailwindcss",
        "-i",
        "./src/popup/tailwind.css",
        "-o",
        "./src/popup/popup.css",
    ],
    {
        stdio: "inherit",
    },
);
