const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ready: () => {
        console.log('Relay ready');
        ipcRenderer.send('ready');
    },

    onUpdater: (fn) => {
        ipcRenderer.on('updater', (event, ...args) => fn(...args));
    },
    updateCheck: () => {
        ipcRenderer.send('updateCheck');
    },

    config: {
        location: (fn) => {
            ipcRenderer.on('config_location', (event, ...args) => fn(...args));
        },

        create: (extension) => {
            ipcRenderer.send('config_create', extension);
        },
        loadForEdit: (client_id) => {
            ipcRenderer.send('config_loadForEdit', client_id);
        },
        loadedForEdit: (fn) => {
            ipcRenderer.on('loadedForEdit', (event, ...args) => fn(...args));
        },
        remove: (client_id) => {
            ipcRenderer.send('config_remove', client_id);
        },
        clients: (fn) => {
            ipcRenderer.on('config_clients', (event, ...args) => fn(...args));
        },
        select: (client_id) => {
            ipcRenderer.send('config_select', client_id);
        },
        selected: (fn) => {
            ipcRenderer.on('config_selected', (event, ...args) => fn(...args));
        },

        revokeToken: (client_id) => {
            ipcRenderer.send('config_revoke', client_id);
        }
    },

    twitchAPI: (route, details) => {
        ipcRenderer.send('twitchAPI', {
            route,
            details
        });
    },
    twitchAPIResult: (fn) =>{
        ipcRenderer.on('twitchAPIResult', (event, ...args) => fn(...args));
    },
    twitchAPIRate: (fn) =>{
        ipcRenderer.on('twitchAPIRate', (event, ...args) => fn(...args));
    },

    errorMsg: (fn) => {
        ipcRenderer.on('errorMsg', (event, ...args) => fn(...args));
    },
    openWeb: (url) => {
        ipcRenderer.send('openWeb', url);
    }
});
