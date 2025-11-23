import executeScriptInTab from "../executeScriptInTab.js";

async function requestUuid() {
    try {
        const response = await fetch(
            "https://www.chess.com/service/user-properties" +
                "/chesscom.user_properties.v1.AuthenticatedPropertiesService" +
                "/GetPropertiesForAuthenticatedUser",
            {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: "{}",
            },
        );

        if (!response.ok) throw new Error("status " + response.status);

        const responseJson = await response.json();
        const uuid = responseJson.userProperties.user;

        browser.runtime.sendMessage({ type: "UUID", uuid: uuid });
    } catch (e) {
        browser.runtime.sendMessage({ type: "UUID", uuid: null });
        browser.runtime.sendMessage({
            type: "ERROR",
            name: e.name,
            message: "Could not get user uuid, cause: " + e.message,
            stack: e.stack,
        });
    }
}

export default async function getUserUuid(senderTab) {
    let userUuid = new Promise((resolve, reject) => {
        browser.runtime.onMessage.addListener(function listener(message) {
            if (message.type === "UUID") {
                browser.runtime.onMessage.removeListener(listener);
                if (message.uuid) {
                    resolve(message.uuid);
                } else {
                    reject();
                }
            }
        });
    });

    executeScriptInTab(senderTab.id, requestUuid);

    return userUuid;
}
