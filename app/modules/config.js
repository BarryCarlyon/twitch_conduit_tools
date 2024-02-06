/**
 * Houses all the functions for CRUD of configuration sets
**/
module.exports = function(lib) {
    let { ipcMain, win, store } = lib;

    const fetch = require('electron-fetch').default;

    let config = {
        create: (event, args) => {
            //console.log(args);
            let { client_id } = args;
            store.set(`clients.${client_id}.name`, args.name);
            store.set(`clients.${client_id}.client_id`, client_id);
            store.set(`clients.${client_id}.client_secret`, args.client_secret);

            config.relay();
        },
        loadForEdit: (event, client_id) => {
            let clients = store.get('clients');
            clients = clients ? clients : {};
            if (clients.hasOwnProperty(client_id)) {
                win.webContents.send('loadedForEdit', clients[client_id]);
                return;
            }
            win.webContents.send('errorMsg', `Config for ${client_id} not found`);
        },
        remove: (event, client_id) => {
            let clients = store.get('clients');
            clients = clients ? clients : {};
            delete clients[client_id];
            store.set('clients', clients);

            config.relay();
        },

        ready: () => {
            config.relay();

            /*
            let active = store.get('active');
            if (active) {
                if (active.client_id && active.version) {
                    console.log('Presetup', active);
                    getExtensionDetails(active.client_id, active.version);
                }
            }
            */

            win.webContents.send('config_location', store.path);
        },
        relay: () => {
            console.log('Config Punt');
            win.webContents.send('config_clients', {
                clients: store.get('clients'),
                active_client_id: store.get('active.client_id')
            });
        },

        select: (event, client_id) => {
            let clients = store.get('clients');
            if (clients.hasOwnProperty(client_id)) {
                store.set('active.client_id', client_id);

                win.webContents.send('config_selected', clients[client_id]);

                return;
            }

            errorMsg(`Did not find config for ${client_id}`);
        },

        revoke: async (event, client_id) => {
            let token = store.get(`extensions.${client_id}.access_token`);
            console.log('About to revoke', client_id, token);
            if (token) {
                // to revoke a token
                // first we need to confirm the clientID for this token
                // in case operator manually put a oAuth token in
                // and the token != clientID
                let validate_url = new URL('https://id.twitch.tv/oauth2/validate');
                let validate_request = await fetch(
                    validate_url,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    }
                );
                if (validate_request.status == 200) {
                    // token OK
                    let validate_response = await validate_request.json();
                    let token_client_id = validate_response.client_id;

                    let revoke_url = new URL('https://id.twitch.tv/oauth2/revoke');
                    let revoke_params = [
                        [ 'client_id', token_client_id ],
                        [ 'token', token ]
                    ];
                    revoke_url.search = new URLSearchParams(revoke_params).toString();

                    let revoke_result = await fetch(
                        revoke_url,
                        {
                            method: 'POST'
                        }
                    );
                    // do do not care about the response really

                    win.webContents.send('errorMsg', 'Token Revoke: ' + revoke_result.status);
                } else {
                    win.webContents.send('errorMsg', 'Token Revoke: Not Valid token');
                }
            }
            store.delete(`extensions.${client_id}.access_token`);
            // broadcast extensions
            config.relay();
        }
    }

    function errorMsg(msg) {
        win.webContents.send('errorMsg', msg);
    }

    ipcMain.on('config_create', config.create);
    ipcMain.on('config_loadForEdit', config.loadForEdit);
    ipcMain.on('config_remove', config.remove);
    ipcMain.on('config_select', config.select);
    ipcMain.on('config_revoke', config.revoke);
    ipcMain.on('ready', config.ready);

    return;
}