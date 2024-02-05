<img src="https://user-images.githubusercontent.com/20999/211199868-8236f9d1-bddd-4fca-9157-6fa7886949fc.png" width="100" align="right" />

[![CodeQL](https://github.com/BarryCarlyon/twitch_extension_tools/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/BarryCarlyon/twitch_extension_tools/actions/workflows/codeql-analysis.yml)

# What is this

Todo

## Installation and Updates

This is an Electron App, so it maybe installed from the GitHub [releases tab](https://github.com/BarryCarlyon/twitch_conduit_tools/releases).

The Windows Build is Code Signed with the Publisher `Barry Carlyon`
The Mac Builds are Code Signed with Apple Cerficates that identify `Barry Carlyon`

You can download the latest version, for Windows and Mac from here on GitHub under [releases](https://github.com/BarryCarlyon/twitch_conduit_tools/releases). These builds will self update

## Uninstallation

You can use Windows "Add and Remove Programs" to uninstall the program.

And on mac just throw it in the trash! :-P

You may need to manually remove data stored in the data/config storage location below.

## Data/Config Storage

Your Extensions Client IDs and secrets are stored locally unencrypted in the file `config.json` in the following location:

Windows:

```
%appdata%/BarryCarlyonTwitchConduitTools/
```

In the file `config.json`

Which follows the format:

```json
{
    "clients": {
        ...
        "a_client_id": {
            "name": "Your Entered Name",
            "client_id": "",
            "client_secret": "a client API secret",
            "access_token": "A recently generated App Access Token"
        }
        ...
    },
    "active": {
        "client_id": "Selected active ClientID set to use"
    },
    "window": {
        "size": [ width, height ],
        "position": [ x, y ]
    }
}
```

⭐ Tip: If you open the Application and the window has gone missing, close the app, open `config.json` for editing and completely reset `"window"` to `{}` and then reopen the app, it'll reset to default display, top left. The App does _try_ to magically 0,0 the window if this happens but it might need a hand!

## Supported Features

- [Get Conduits](https://dev.twitch.tv/docs/api/reference/#get-conduits)
- [Create Conduits](https://dev.twitch.tv/docs/api/reference/#create-conduits)
- [Update Conduits](https://dev.twitch.tv/docs/api/reference/#update-conduits)
- [Delete Conduit](https://dev.twitch.tv/docs/api/reference/#delete-conduit)
- [Get Conduit Shards](https://dev.twitch.tv/docs/api/reference/#get-conduit-shards)
- [Update Conduit Shards](https://dev.twitch.tv/docs/api/reference/#update-conduit-shards)

## Notes

- Uses Electron to provide as a Desktop App
- Uses Bootstrap for primary layout
- Uses GitHub for update delivery and code management (and mac app store for MAS builds)
- JWT tokens are generated _inside_ the App via [auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), as apposed to "ClientSide" like [this example](https://barrycarlyon.github.io/twitch_misc/examples/extension_config/)
- A number of [sindresorhus](https://github.com/sindresorhus/) Electron Modules.

## License

This project is Licensed under [Do What The F*ck You Want To Public License](https://github.com/BarryCarlyon/twitch_extension_tools/blob/main/LICENSE), so Just Do What the F*ck you want to!

## Development Notes

This is an [Electron Project](https://www.electronjs.org/)

To run locally, after cloning, just

```
$ npm install
$ npn run start
```

## Further Help with Twitch API

- [TwitchDev Documentation](http://dev.twitch.tv/docs)
- [TwitchDev Support Forums](https://discuss.dev.twitch.tv/)
- [TwitchDev Discord](https://link.twitch.tv/devchat)
- [TwitchDev Other Help](https://dev.twitch.tv/support)

[![TwitchDev Discord](https://discordapp.com/api/guilds/504015559252377601/embed.png?style=banner2)](https://link.twitch.tv/devchat)

## OMGLIEKWUT OHMYGOODNESS U SO MUCH HELP

Thank you for the help I want to give you beer/coffee money -> Check the Funding/Sponsor details
