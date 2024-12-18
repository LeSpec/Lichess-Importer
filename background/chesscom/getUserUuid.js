import executeScriptInTab from "../executeScriptInTab.js";

async function requestUuid() {
    try {
        const response = await fetch(
            "https://www.chess.com/service/user-properties" +
                "/chesscom.user_properties.v1.AuthenticatedPropertiesService" +
                "/GetPropertiesForAuthenticatedUser",
            {
                method: "POST",
                headers: { "Content-Type": "application/json", credentials: "include", mode: "cors" },
                body: "{}",
            }
        );

        if (!response.ok) throw "status " + response.status;

        const responseJson = await response.json();
        const uuid = responseJson.userProperties.user;

        browser.runtime.sendMessage({ type: "UUID", uuid: uuid });
    } catch (e) {
        browser.runtime.sendMessage({ type: "UUID", uuid: null });
        browser.runtime.sendMessage({ type: "ERROR", context: "Could not get user uuid", error: e });
    }
}

export default async function getUserUuid(senderTab) {
    let userUuid = new Promise((resolve) => {
        browser.runtime.onMessage.addListener(function listener(message) {
            if (message.type === "UUID") {
                browser.runtime.onMessage.removeListener(listener);
                resolve(message.uuid);
            }
        });
    });

    executeScriptInTab(senderTab.id, requestUuid);

    return userUuid;
}
