/*
Every analysis request already triggers a uuid fetch which gets stored in a cache variable.
For the first analysis request there is no uuid value cached, so if chess.com doesn't respond in time we won't have a uuid.
Solution: get a fetch in early before the first analysis request.

There are three ways to fetch uuid:
1. Fetch on every chess.com page
2. Never fetch (no early fetch)
3. Fetch only on certain pages

I decided to only fetch on home page to keep the traffic minimal, but still get a fetch in early.
*/

const docuemntUrl = document.location.href;
if (docuemntUrl.startsWith("https://www.chess.com/home")) {
    browser.runtime.sendMessage({ type: "UUID_REQUEST" });
}
