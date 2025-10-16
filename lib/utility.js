export async function measureTime(infoTag, task) {
    const start = performance.now();
    const result = await task();
    const end = performance.now();
    console.log(`${infoTag}: ${end - start} ms`);
    return result;
}

/* 
    How to use: await sleep(2000)
 */
export function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// using console.log for now since traffic outside the extension already produces a lot of error and warning messages
export function handleError(context, error) {
    console.log(`__Lichess Importer__ ${context}${error ? `, ${error}` : ""}`);
}
