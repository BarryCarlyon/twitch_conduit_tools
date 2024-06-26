/**
 * Houses all the functions for Access Token API Access
 **/
export default function ({ ipcMain, win, store }) {
    async function accessToken(client_id) {
        console.log("Running access_token for", client_id);
        let access_token = store.get(`clients.${client_id}.access_token`);
        console.log("Loaded existing token");
        // validate existing token
        if (access_token) {
            let validate_url = new URL("https://id.twitch.tv/oauth2/validate");
            try {
                let validate_req = await fetch(validate_url, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });
                //let validate_resp = await validate_url.json();
                console.log(`Validated: ${validate_req.status}`);

                if (validate_req.status != 200) {
                    // yay
                    console.log("Regenerate");
                    store.delete(`clients.${client_id}.access_token`);
                    access_token = "";
                }
            } catch (err) {
                console.error("validate error", err);
                // remove
                store.delete(`clients.${client_id}.access_token`);
                // wipe
                access_token = "";
            }
        }

        if (!access_token) {
            let client_secret = store.get(`clients.${client_id}.client_secret`);
            if (!client_secret) {
                win.webContents.send("errorMsg", `No Client Secret for ${client_id}`);
                return;
            }

            // token time
            let token_url = new URL("https://id.twitch.tv/oauth2/token");
            let token_params = [
                ["client_id", client_id],
                ["client_secret", client_secret],
                ["grant_type", "client_credentials"],
            ];
            token_url.search = new URLSearchParams(token_params).toString();

            let token_req = await fetch(token_url, {
                method: "POST",
            });
            let token_resp = await token_req.json();
            if (!token_resp.access_token) {
                console.log(token_resp);
                win.webContents.send("errorMsg", "Failed to get an Access Token");
                return;
            }

            console.log("Generated a token");
            // store in persistent
            store.set(`clients.${client_id}.access_token`, token_resp.access_token);
        }

        return;
    }

    async function convertToId(data) {
        let { client_id, login, el } = data;

        if (!login || login == "") {
            win.webContents.send("errorMsg", "Username is required to convert to a UserID");
            return;
        }

        try {
            await accessToken(client_id);

            let access_token = store.get(`clients.${client_id}.access_token`);

            // username to ID time
            let users_url = new URL("https://api.twitch.tv/helix/users");
            let users_params = [["login", login]];
            users_url.search = new URLSearchParams(users_params).toString();

            let users_req = await fetch(users_url, {
                method: "GET",
                headers: {
                    "Client-ID": client_id,
                    "Authorization": `Bearer ${access_token}`,
                },
            });
            let users_resp = await users_req.json();

            console.log(users_resp);

            if (users_resp.hasOwnProperty("data") && users_resp.data.length == 1) {
                console.log("send back", users_resp.data[0].id);
                win.webContents.send("convertedToId", {
                    el,
                    id: users_resp.data[0].id,
                });
                return;
            }
            win.webContents.send("errorMsg", "User not found");
        } catch (err) {
            console.error(err);
        }
    }

    return accessToken;
}
