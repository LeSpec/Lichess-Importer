import { settingIds, settings } from "../settings.js";

renderSettings();

async function renderSettings() {
    const settingsContainer = document.createElement("div");
    settingsContainer.className = "divide-y divide-gray-700";

    for (const { id, title, description } of settings) {
        const settingLabel = document.createElement("label");
        settingLabel.className =
            "flex cursor-pointer items-center justify-between px-4 py-2 transition-colors select-none hover:bg-gray-700";

        const info = document.createElement("div");
        info.className = "mr-10 flex flex-col gap-0.5";

        const heading = document.createElement("h2");
        heading.className = "text-sm font-medium";
        heading.textContent = title;

        const desc = document.createElement("p");
        desc.className = "text-xs text-gray-400";
        desc.textContent = description;

        info.appendChild(heading);
        info.appendChild(desc);

        const toggle = await buildToggle(id);

        settingLabel.appendChild(info);
        settingLabel.appendChild(toggle);

        settingsContainer.appendChild(settingLabel);
    }

    document.querySelector("main").append(settingsContainer);
}

async function buildToggle(id) {
    const toggleDiv = document.createElement("div");
    toggleDiv.className = "relative inline-flex items-center";

    const cbox = document.createElement("input");
    cbox.type = "checkbox";
    cbox.id = id;
    cbox.className = "peer sr-only";
    await browser.storage.local.get(id).then((result) => {
        cbox.checked = result[id];
    });
    cbox.addEventListener("change", handleCboxChange);

    const toggleBg = document.createElement("div");
    toggleBg.className =
        "h-5 w-10 rounded-full bg-gray-600 transition-all peer-checked:bg-blue-500";

    const toggleCircle = document.createElement("span");
    toggleCircle.className =
        "absolute top-0.5 left-0.5 h-4 w-4 transform rounded-full bg-gray-200 shadow transition-all peer-checked:translate-x-5";

    toggleDiv.appendChild(cbox);
    toggleDiv.appendChild(toggleBg);
    toggleDiv.appendChild(toggleCircle);

    return toggleDiv;
}

function handleCboxChange(event) {
    const cbox = event.currentTarget;
    browser.storage.local.set({ [cbox.id]: cbox.checked });
}

browser.storage.local.onChanged.addListener((changes) => {
    for (const [key, { newValue }] of Object.entries(changes)) {
        if (settingIds.includes(key)) {
            document.getElementById(key).checked = newValue;
        }
    }
});
