/**
 * Houses all the functions for JWT API Access
 **/
export default function ({ ipcMain, win, store, accessToken }) {
    ipcMain.on("twitchAPI", (event, data) => {
        console.log("in twitchAPI", data);
        let { route, details } = data;

        switch (route) {
            // Get Conduits - https://dev.twitch.tv/docs/api/reference/#get-conduits
            case "getConduits":
                getConduits();
                return;
            // Create Conduits - https://dev.twitch.tv/docs/api/reference/#create-conduits
            case "createConduits":
                createConduits(details);
                return;
            // Update Conduits - https://dev.twitch.tv/docs/api/reference/#update-conduits
            case "updateConduits":
                updateConduits(details);
                return;
            // Delete Conduits - https://dev.twitch.tv/docs/api/reference/#delete-conduit
            case "deleteConduits":
                deleteConduits(details);
                return;
            // Get Conduit Shards - https://dev.twitch.tv/docs/api/reference/#get-conduit-shards
            case "getConduitShards":
                getConduitShards();
                return;
            // Update Conduit Shards - https://dev.twitch.tv/docs/api/reference/#update-conduit-shards
            case "updateConduitShards":
                updateConduitShards(details);
                return;

            case "getAndFilterSubscriptions":
                getAndFilterSubscriptions();
                return;
            case "createSubscription":
                createSubscription(details);
                return;
            case "deleteSubscription":
                deleteSubscription(details);
                return;
        }
    });

    async function callTwitch(route, url, options) {
        let client_id = store.get("active.client_id");

        await accessToken(client_id);

        let access_token = store.get(`clients.${client_id}.access_token`);

        let req = await fetch(url, {
            headers: {
                "Client-ID": client_id,
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            ...options,
        });

        let resp = {};
        if (req.status == 204) {
            // there is no json
        } else {
            resp = await req.json();
        }

        //console.log(req.status, resp.data);
        //console.log(resp.data[1]);

        let pl = {
            status: req.status,
            ratelimitRemain: req.headers.get("ratelimit-remaining"),
            ratelimitLimit: req.headers.get("ratelimit-limit"),

            message: resp.message ? resp.message : "",
            data: resp.data ? resp.data : [],
        };

        if (route == "internal") {
            // relay rate limit
            win.webContents.send("twitchAPIRate", {
                status: req.status,
                ratelimitRemain: req.headers.get("ratelimit-remaining"),
                ratelimitLimit: req.headers.get("ratelimit-limit"),
            });
            // internal
            pl.resp = resp;
            return pl;
        }

        pl.route = route;
        win.webContents.send("twitchAPIResult", pl);
    }

    async function getConduits() {
        let url = new URL(`https://api.twitch.tv/helix/eventsub/conduits`);
        callTwitch("getConduits", url, {
            method: "GET",
        });
    }

    async function createConduits(details) {
        let url = new URL(`https://api.twitch.tv/helix/eventsub/conduits`);
        callTwitch("createConduits", url, {
            method: "POST",
            body: JSON.stringify(details),
        });
    }
    async function deleteConduits(details) {
        console.log("deleteCondtuis", details);
        let url = new URL(`https://api.twitch.tv/helix/eventsub/conduits`);
        callTwitch("deleteConduits", url, {
            method: "DELETE",
            body: JSON.stringify(details),
        });
    }

    async function updateConduits(payload) {
        console.log("updateConduits", payload);
        let url = new URL(`https://api.twitch.tv/helix/eventsub/conduits`);
        await callTwitch("updateConduits", url, {
            method: "PATCH",
            body: JSON.stringify(payload),
        });
    }

    function getConduitShards(details) {
        details = details ? details : {};
        let { after } = details;

        let params = [["conduit_id", store.get("active.conduit_id")]];
        if (details.hasOwnProperty("after")) {
            params.push(["after", after]);
        }
        /*
        status
        enabled or a bunch of other stuff
        reload do with an or _anything else_
        for ANY dead shard
        */

        let url = new URL(`https://api.twitch.tv/helix/eventsub/conduits/shards`);
        url.search = new URLSearchParams(params);

        callTwitch("getConduitShards", url, {
            method: "GET",
        });
    }

    function updateConduitShards(details) {
        let conduit_id = store.get("active.conduit_id");
        // extract
        let { shard_id } = details;
        let { transport } = details;
        let { callback, secret, session_id } = details;
        // sanity check

        let payload = {
            conduit_id,
            shards: [
                {
                    id: shard_id,
                    transport: {},
                },
            ],
        };
        // build payload
        if (transport == "webhook") {
            payload.shards[0].transport = {
                method: "webhook",
                callback,
                secret,
            };
        } else {
            payload.shards[0].transport = {
                method: "websocket",
                session_id,
            };
        }
        //

        let url = new URL(`https://api.twitch.tv/helix/eventsub/conduits/shards`);
        callTwitch("updateConduitShards", url, {
            method: "PATCH",
            body: JSON.stringify(payload),
        });
    }

    function getAndFilterSubscriptions() {
        let conduitID = store.get("active.conduit_id");
        if (!conduitID) {
            console.error("No Active Conduit");
            return;
        }

        let matching = [];

        async function loadPage(after) {
            console.log("Loading", after);
            let url = new URL(`https://api.twitch.tv/helix/eventsub/subscriptions`);
            if (after) {
                url.search = new URLSearchParams([["after", after]]);
            }
            let pl = await callTwitch("internal", url, {
                method: "GET",
            });

            let { resp } = pl;
            let { data, pagination } = resp;

            //console.log(data);process.exit();
            for (var x = 0; x < data.length; x++) {
                let { transport } = data[x];
                if (transport.method == "conduit") {
                    if (transport.conduit_id == conduitID) {
                        // valid
                        matching.push(data[x]);
                    }
                }
            }

            if (pagination) {
                let { cursor } = pagination;
                if (cursor) {
                    return loadPage(cursor);
                }
            }
            // complete send to front
            pl.route = "gotAndFilterSubscriptions";
            pl.data = matching;
            win.webContents.send("twitchAPIResult", pl);
        }

        loadPage(false);
    }

    async function createSubscription(payload) {
        let url = new URL(`https://api.twitch.tv/helix/eventsub/subscriptions`);
        await callTwitch("createSubscriptionResult", url, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }
    async function deleteSubscription(details) {
        let url = new URL(`https://api.twitch.tv/helix/eventsub/subscriptions`);
        callTwitch("deletedSubscription", url, {
            method: "DELETE",
            body: JSON.stringify(details),
        });
    }

    ipcMain.on("config_conduit_select", async (event, conduit_id) => {
        // check conduit is ours/acitve/loadable?
        console.log("setting to", conduit_id);
        // set and punt
        await store.set("active.conduit_id", conduit_id);
        win.webContents.send("config_conduit_selected", conduit_id);
    });
    // wipe at restart
    store.delete("active.conduit_id");
}
