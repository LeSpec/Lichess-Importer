export const settings = [
    {
        id: "compAnalysis",
        title: "Computer Analysis",
        description: "Auto-request computer analysis",
        default: true,
    },
    {
        id: "newTab",
        title: "Open New Tab",
        description: "Open Lichess in a new tab",
        default: true,
    },
];

export const defaultSettings = settings.reduce((acc, setting) => {
    acc[setting.id] = setting.default;
    return acc;
}, {});
export const settingIds = settings.map((setting) => setting.id);
