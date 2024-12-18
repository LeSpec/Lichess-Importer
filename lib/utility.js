/* 
    How to use:
    
    define on top level:
    let timer;
    
    timer = createTimer("process");
    timer.log("Step 1 completed");
    timer.log("Step 2 completed");
    timer.end("Process completed");
 */
export function createTimer(label, isActive = 1) {
    isActive ? console.time(label) : {};
    return {
        log: (...messages) => (isActive ? console.timeLog(label, ...messages) : {}),
        end: (...messages) => (isActive ? console.timeEnd(label, ...messages) : {}),
    };
}

/* 
    How to use: await sleep(2000)
 */
export function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// using console.log for now since traffic outside the extension already produces a lot of error and warning messages
export function handleError(context, error) {
    console.log("__Lichess Importer__", context);
    if (error) console.log(error);
}
