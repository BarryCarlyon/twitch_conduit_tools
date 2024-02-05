/**
 * Houses all the functions for JWT API Access
**/
module.exports = function(lib) {
    let { ipcMain, win, store, accessToken } = lib;

    const fetch = require('electron-fetch').default;

    ipcMain.on('twitchAPI', (event, data) => {
        console.log('in twitchAPI', data);
        let { route, details } = data;

        switch (route) {
            // Get Conduits - https://dev.twitch.tv/docs/api/reference/#get-conduits
            case 'getConduits':
                getConduits();
                return;
            // Create Conduits - https://dev.twitch.tv/docs/api/reference/#create-conduits

            // Update Conduits - https://dev.twitch.tv/docs/api/reference/#update-conduits
            case 'updateConduits':
                updateConduits(details);
                return;
            // Delete Conduits - https://dev.twitch.tv/docs/api/reference/#delete-conduit
            // Get Conduit Shards - https://dev.twitch.tv/docs/api/reference/#get-conduit-shards
            case 'getConduitShards':
                getConduitShards(details);
                return;
            // Update Conduit Shards - https://dev.twitch.tv/docs/api/reference/#update-conduit-shards
            case 'updateConduitShards':
                updateConduitShards(details);
                return;
        }
    });


    async function callTwitch(route, url, options) {
        let client_id = store.get('active.client_id');

        await accessToken(client_id);

        let access_token = store.get(`clients.${client_id}.access_token`);

        let req = await fetch(
            url,
            {
                headers: {
                    'Client-ID': client_id,
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                },
                ...options
            }
        );
        let resp = await req.json();

        console.log(req.status, resp.data);
        //console.log(resp.data[1]);

        win.webContents.send('twitchAPIResult', {
            route,
            status: req.status,
            ratelimitRemain: req.headers.get('ratelimit-remaining'),
            ratelimitLimit: req.headers.get('ratelimit-limit'),

            message: (resp.message ? resp.message : ''),
            data: (resp.data ? resp.data : [])
        });
    }

    async function getConduits() {
        let url = new URL(`https://api.twitch.tv/helix/eventsub/conduits`);
        callTwitch(
            'getConduits',
            url,
            {
                method: 'GET'
            }
        );
    }

    function updateConduits(payload) {
        let url = new URL(`https://api.twitch.tv/helix/eventsub/conduits`);
        callTwitch(
            'updateConduits',
            url,
            {
                method: 'PATCH',
                body: JSON.stringify(payload)
            }
        );
    }

    function getConduitShards(details) {
        let { id, after } = details;

        let params = [
            [ 'conduit_id', id ]
        ]
        if (details.hasOwnProperty('after')) {
            params.push([ 'after', after ]);
        }
        /*
        status
        enabled or a bunch of other stuff
        reload do with an or _anything else_
        for ANY dead shard
        */

        let url = new URL(`https://api.twitch.tv/helix/eventsub/conduits/shards`);
        url.search = new URLSearchParams(params);

        callTwitch(
            'getConduitShards',
            url,
            {
                method: 'GET'
            }
        );
    }

    function updateConduitShards(details) {
        // extract
        let { conduit_id, shard_id } = details;
        let { transport } = details;
        let { callback, secret, session_id } = details;
        // sanity check

        let payload = {
            conduit_id,
            shards: [
                {
                    id: shard_id,
                    transport: {}
                }
            ]
        }
        // build payload
        if (transport == 'webhook') {
            payload.shards[0].transport = {
                method: 'webhook',
                callback,
                secret
            }
        } else {
            payload.shards[0].transport = {
                method: 'websocket',
                session_id
            }
        }
        //

        let url = new URL(`https://api.twitch.tv/helix/eventsub/conduits/shards`);
        callTwitch(
            'updateConduitShards',
            url,
            {
                method: 'PATCH',
                body: JSON.stringify(payload)
            }
        );
    }
}