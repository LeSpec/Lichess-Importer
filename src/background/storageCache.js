class StorageCache {
    constructor() {
        browser.storage.local.get().then((storage) => Object.assign(this, storage));
        browser.storage.local.onChanged.addListener((changes) => {
            for (const key in changes) {
                this[key] = changes[key].newValue;
            }
        });
    }
}

export default new StorageCache();
